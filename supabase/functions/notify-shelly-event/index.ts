import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Notification edge function for shelly-50.
// Called by Postgres triggers AFTER INSERT on shelly_rsvps,
// shelly_video_messages, and shelly_photos. Sends a formatted summary
// email to every address in the shelly_admins table via Resend.
//
// verify_jwt is intentionally disabled because triggers don't pass JWTs.
// Recipients are NEVER taken from the request body — they're looked up
// server-side from shelly_admins via the service role key — so a leaked
// URL can't be used to spam arbitrary addresses.

type WebhookPayload = {
  table?: string;
  type?: string;
  record?: Record<string, unknown>;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") || "Shelly 50 <onboarding@resend.dev>";
const SITE_URL = Deno.env.get("NOTIFY_SITE_URL") || "https://shelly-50.vercel.app";

function esc(s: unknown): string {
  if (s === null || s === undefined) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderEmail(
  table: string,
  record: Record<string, unknown>,
): { subject: string; html: string; text: string } {
  if (table === "shelly_rsvps") {
    const name = String(record.full_name ?? "someone");
    const partySize = Number(record.party_size ?? 1);
    const notAttending = Boolean(record.not_attending);
    const attendance = (record.attendance ?? {}) as Record<string, boolean>;
    const eventsChecked = Object.entries(attendance).filter(([, v]) => v).length;

    const subject = notAttending
      ? `\u{1F614} ${name} can't make it`
      : `\u{2728} New RSVP: ${name} (party of ${partySize}, ${eventsChecked} event${eventsChecked === 1 ? "" : "s"})`;

    const html = `
      <h2 style="font-family: Georgia, serif;">${esc(name)}</h2>
      <p><strong>Status:</strong> ${notAttending ? "\u{1F614} Can't attend" : `\u{2728} Attending — party of ${partySize}, ${eventsChecked} event${eventsChecked === 1 ? "" : "s"} checked`}</p>
      ${record.email ? `<p><strong>Email:</strong> ${esc(record.email)}</p>` : ""}
      ${record.phone ? `<p><strong>Phone:</strong> ${esc(record.phone)}</p>` : ""}
      ${record.dietary_notes ? `<p><strong>Dietary notes:</strong> ${esc(record.dietary_notes)}</p>` : ""}
      ${record.message ? `<p><strong>Message:</strong> ${esc(record.message)}</p>` : ""}
      <p style="margin-top:24px"><a href="${SITE_URL}/admin">Open admin dashboard →</a></p>
    `;
    const text = `${name} — ${notAttending ? "Can't attend" : `party of ${partySize}, ${eventsChecked} events`}\n${record.email ? `Email: ${record.email}\n` : ""}${record.phone ? `Phone: ${record.phone}\n` : ""}${record.message ? `Message: ${record.message}\n` : ""}\nAdmin: ${SITE_URL}/admin`;
    return { subject, html, text };
  }

  if (table === "shelly_video_messages") {
    const name = String(record.full_name ?? "someone");
    const subject = `\u{1F39E}️ New birthday video from ${name}`;
    const html = `
      <h2 style="font-family: Georgia, serif;">New video from ${esc(name)}</h2>
      ${record.email ? `<p><strong>Email:</strong> ${esc(record.email)}</p>` : ""}
      ${record.caption ? `<p>${esc(record.caption)}</p>` : ""}
      <p><strong>File:</strong> ${esc(record.storage_path)}</p>
      <p style="margin-top:24px"><a href="${SITE_URL}/admin">View in admin →</a> · <a href="${SITE_URL}/collage">See the wall</a></p>
    `;
    const text = `New video from ${name}${record.caption ? ` — ${record.caption}` : ""}\nFile: ${record.storage_path}\n${SITE_URL}/admin`;
    return { subject, html, text };
  }

  if (table === "shelly_photos") {
    const name = String(record.uploader_name ?? "someone");
    const subject = `\u{1F4F8} New photo from ${name}`;
    const html = `
      <h2 style="font-family: Georgia, serif;">New photo from ${esc(name)}</h2>
      ${record.uploader_email ? `<p><strong>Email:</strong> ${esc(record.uploader_email)}</p>` : ""}
      ${record.caption ? `<p>${esc(record.caption)}</p>` : ""}
      ${record.photo_year ? `<p><strong>Year:</strong> ${esc(record.photo_year)}</p>` : ""}
      <p><strong>File:</strong> ${esc(record.storage_path)}</p>
      <p style="margin-top:24px"><a href="${SITE_URL}/admin">View in admin →</a> · <a href="${SITE_URL}/collage">See the wall</a></p>
    `;
    const text = `New photo from ${name}${record.caption ? ` — ${record.caption}` : ""}\nFile: ${record.storage_path}\n${SITE_URL}/admin`;
    return { subject, html, text };
  }

  return {
    subject: `New ${table} event`,
    html: `<pre>${esc(JSON.stringify(record, null, 2))}</pre>`,
    text: JSON.stringify(record),
  };
}

async function getRecipients(): Promise<string[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.from("shelly_admins").select("email");
  if (error) {
    console.error("shelly_admins lookup failed:", error);
    return [];
  }
  return (data ?? []).map((r: { email: string }) => r.email);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("ok", { status: 200 });
  }

  let payload: WebhookPayload = {};
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  const { table, record } = payload;
  if (!table || !record) {
    return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400 });
  }

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return new Response(JSON.stringify({ ok: true, skipped: "no_api_key" }), { status: 200 });
  }

  const recipients = await getRecipients();
  if (recipients.length === 0) {
    return new Response(JSON.stringify({ ok: true, skipped: "no_recipients" }), { status: 200 });
  }

  const { subject, html, text } = renderEmail(table, record);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: recipients,
      subject,
      html,
      text,
    }),
  });

  const responseText = await res.text();
  if (!res.ok) {
    console.error("Resend send failed", res.status, responseText);
    return new Response(JSON.stringify({ ok: false, status: res.status, body: responseText }), {
      status: 200, // don't break the DB insert path
    });
  }

  return new Response(JSON.stringify({ ok: true, response: responseText }), { status: 200 });
});
