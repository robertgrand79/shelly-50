import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Bulk-invite / broadcast email sender for shelly-50.
// Called by /admin to send invite emails or updates to everyone in
// shelly_invites. Requires a valid Supabase JWT belonging to an admin
// (verified server-side against shelly_admins) — so a leaked URL
// can't be abused.

type Body = {
  subject?: string;
  html?: string;
  text?: string;
  /** Optional preview-only flag: if true, send only to the caller. */
  preview_to?: string;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") || "Shelly 50 <onboarding@resend.dev>";
const SITE_URL = Deno.env.get("NOTIFY_SITE_URL") || "https://shelly-50.vercel.app";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function j(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function personalize(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? "");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return j(405, { error: "method_not_allowed" });

  if (!RESEND_API_KEY) return j(500, { error: "resend_not_configured" });

  // --- AuthN: caller must be a signed-in admin ---
  const authHeader = req.headers.get("authorization") || "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!jwt) return j(401, { error: "missing_token" });

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user?.email) return j(401, { error: "invalid_token" });
  const callerEmail = userData.user.email;

  const { data: isAdmin, error: adminErr } = await userClient.rpc("is_shelly_admin");
  if (adminErr || !isAdmin) return j(403, { error: "not_admin" });

  // --- Parse + validate body ---
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return j(400, { error: "invalid_json" });
  }
  const subject = body.subject?.trim();
  const html = body.html?.trim();
  const text = body.text?.trim();
  if (!subject || !html) return j(400, { error: "missing_fields" });

  // --- Resolve recipients ---
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  let recipients: { email: string; name: string | null }[] = [];
  if (body.preview_to) {
    recipients = [{ email: body.preview_to, name: callerEmail.split("@")[0] }];
  } else {
    const { data, error } = await admin
      .from("shelly_invites")
      .select("email, name")
      .order("added_at", { ascending: true });
    if (error) return j(500, { error: "invite_lookup_failed", detail: error.message });
    recipients = (data ?? []) as typeof recipients;
  }
  if (recipients.length === 0) return j(400, { error: "no_recipients" });

  // --- Send via Resend batch API (up to 100 emails per call) ---
  const chunk = <T>(arr: T[], n: number) =>
    Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

  let success = 0;
  let failure = 0;
  const failures: { email: string; reason: string }[] = [];

  for (const group of chunk(recipients, 100)) {
    const payload = group.map((r) => {
      const vars = {
        name: r.name ?? "friend",
        first_name: (r.name ?? "").split(" ")[0] || "friend",
        email: r.email,
        site_url: SITE_URL,
      };
      return {
        from: FROM_EMAIL,
        to: [r.email],
        subject: personalize(subject, vars),
        html: personalize(html, vars),
        text: text ? personalize(text, vars) : undefined,
      };
    });

    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const responseText = await res.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { raw: responseText };
    }

    if (!res.ok) {
      group.forEach((r) =>
        failures.push({ email: r.email, reason: `${res.status}: ${responseText}`.slice(0, 200) }),
      );
      failure += group.length;
      continue;
    }

    // Resend batch response: { data: [{ id }, ...] } — items align with input order.
    const items = (parsed as { data?: unknown[] })?.data ?? [];
    group.forEach((r, i) => {
      const item = items[i] as { id?: string; error?: { message?: string } } | undefined;
      if (item?.id) success += 1;
      else {
        failure += 1;
        failures.push({
          email: r.email,
          reason: item?.error?.message ?? "unknown",
        });
      }
    });
  }

  if (!body.preview_to) {
    await admin.from("shelly_broadcasts").insert({
      subject,
      body_html: html,
      recipient_count: recipients.length,
      success_count: success,
      failure_count: failure,
      sent_by_email: callerEmail,
    });
  }

  return j(200, {
    ok: failure === 0,
    sent: success,
    failed: failure,
    failures,
    preview: Boolean(body.preview_to),
  });
});
