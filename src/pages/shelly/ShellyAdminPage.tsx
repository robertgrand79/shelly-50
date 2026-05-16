import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "@/pages/shelly/Helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Download,
  LogOut,
  Mail,
  Users,
  ImageIcon,
  Video,
  ShieldAlert,
  Trash2,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import { SCHEDULE } from "@/pages/shelly/schedule";
import ThemeToggle from "@/components/ThemeToggle";

type Tab = "rsvps" | "photos" | "videos" | "invites";

interface RsvpRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  party_size: number;
  not_attending: boolean;
  attendance: Record<string, boolean>;
  dietary_notes: string | null;
  message: string | null;
  created_at: string;
}

interface PhotoRow {
  id: string;
  uploader_name: string | null;
  uploader_email: string | null;
  storage_path: string;
  caption: string | null;
  photo_year: number | null;
  created_at: string;
}

interface VideoRow {
  id: string;
  full_name: string;
  email: string | null;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  caption: string | null;
  created_at: string;
}

interface InviteRow {
  id: string;
  email: string;
  name: string | null;
  notes: string | null;
  added_at: string;
}

interface BroadcastRow {
  id: string;
  subject: string;
  recipient_count: number;
  success_count: number;
  failure_count: number;
  sent_by_email: string | null;
  sent_at: string;
}

const ALL_EVENTS = SCHEDULE.flatMap((part) =>
  part.days.flatMap((d) =>
    d.events
      .filter((e) => !e.informational)
      .map((e) => ({ id: e.id, label: `${d.shortDate} · ${e.title}` })),
  ),
);

export default function ShellyAdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setBootstrapping(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-page text-strong font-sans">
      <Helmet title="Shelly 50th — Admin" />

      <header className="sticky top-0 z-40 backdrop-blur-md bg-page-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-default hover:text-default transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="tracking-wide">Back to site</span>
          </Link>
          <div className="flex items-center gap-3 text-default text-sm">
            <Sparkles className="w-4 h-4 text-gold-bright" />
            <span className="tracking-wide">Admin</span>
            {session && (
              <button
                onClick={() => supabase.auth.signOut()}
                className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-line-strong text-muted hover:text-default hover:bg-gold-soft text-xs"
              >
                <LogOut className="w-3 h-3" />
                Sign out
              </button>
            )}
            <ThemeToggle className="ml-1" />
          </div>
        </div>
      </header>

      {bootstrapping ? (
        <div className="py-24 flex items-center justify-center text-muted text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking session…
        </div>
      ) : session ? (
        <AdminDashboard session={session} />
      ) : (
        <SignIn />
      )}
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!email.trim()) return;
    setSending(true);
    const redirectTo = `${window.location.origin}/admin`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-md mx-auto rounded-2xl border border-line bg-surface-1 p-8 text-center">
        <Sparkles className="w-7 h-7 text-gold-bright mx-auto mb-4" />
        <h1
          className="font-serif text-3xl text-strong mb-2"
          style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        >
          Admin sign-in
        </h1>
        <p className="text-muted text-sm mb-6">
          Enter your admin email and we'll send you a sign-in link.
        </p>

        {sent ? (
          <div className="text-default text-sm">
            <Mail className="w-5 h-5 text-gold-bright mx-auto mb-2" />
            Check <span className="text-gold">{email}</span> for a magic link. It expires in 1
            hour.
            <button
              onClick={() => setSent(false)}
              className="block mx-auto mt-4 text-xs text-muted underline hover:text-default"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <Label className="text-muted text-xs tracking-wide uppercase">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="you@example.com"
              className="bg-page border-line-strong text-strong placeholder:text-faint focus-visible:ring-gold"
            />
            <Button
              onClick={send}
              disabled={sending || !email.trim()}
              className="w-full bg-cta hover:bg-cta-hover font-medium rounded-full py-5"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send me a link"
              )}
            </Button>
            <p className="text-faint text-[11px] mt-3 leading-relaxed">
              Only emails on the admin allowlist can access the data after signing in.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function AdminDashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("rsvps");
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const loadAll = useCallback(async () => {
    const [rsvpsRes, photosRes, videosRes, invitesRes, broadcastsRes] = await Promise.all([
      supabase.from("shelly_rsvps").select("*").order("created_at", { ascending: false }),
      supabase.from("shelly_photos").select("*").order("created_at", { ascending: false }),
      supabase.from("shelly_video_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("shelly_invites").select("*").order("added_at", { ascending: true }),
      supabase.from("shelly_broadcasts").select("*").order("sent_at", { ascending: false }).limit(20),
    ]);
    setRsvps((rsvpsRes.data ?? []) as RsvpRow[]);
    setPhotos((photosRes.data ?? []) as PhotoRow[]);
    setVideos((videosRes.data ?? []) as VideoRow[]);
    setInvites((invitesRes.data ?? []) as InviteRow[]);
    setBroadcasts((broadcastsRes.data ?? []) as BroadcastRow[]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: isAdmin } = await supabase.rpc("is_shelly_admin");
      if (cancelled) return;
      if (!isAdmin) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      await loadAll();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  const deletePhoto = useCallback(
    async (photo: PhotoRow) => {
      if (!window.confirm(`Permanently delete this photo? This can't be undone.`)) return;
      const { error: storageErr } = await supabase.storage
        .from("shelly-photos")
        .remove([photo.storage_path]);
      if (storageErr) {
        console.error(storageErr);
        toast.error(`Couldn't delete file: ${storageErr.message}`);
        return;
      }
      const { error: rowErr } = await supabase.from("shelly_photos").delete().eq("id", photo.id);
      if (rowErr) {
        console.error(rowErr);
        toast.error(`Storage file removed but row delete failed: ${rowErr.message}`);
        return;
      }
      setPhotos((p) => p.filter((x) => x.id !== photo.id));
      toast.success("Photo deleted.");
    },
    [],
  );

  const deleteVideo = useCallback(
    async (video: VideoRow) => {
      if (!window.confirm(`Permanently delete this video message? This can't be undone.`)) return;
      const { error: storageErr } = await supabase.storage
        .from("shelly-videos")
        .remove([video.storage_path]);
      if (storageErr) {
        console.error(storageErr);
        toast.error(`Couldn't delete file: ${storageErr.message}`);
        return;
      }
      const { error: rowErr } = await supabase
        .from("shelly_video_messages")
        .delete()
        .eq("id", video.id);
      if (rowErr) {
        console.error(rowErr);
        toast.error(`Storage file removed but row delete failed: ${rowErr.message}`);
        return;
      }
      setVideos((v) => v.filter((x) => x.id !== video.id));
      toast.success("Video deleted.");
    },
    [],
  );

  if (accessDenied) {
    return (
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto rounded-2xl border border-line-strong bg-gold-soft p-8 text-center">
          <ShieldAlert className="w-7 h-7 text-danger mx-auto mb-3" />
          <h2 className="text-strong font-medium mb-1">Not authorized</h2>
          <p className="text-muted text-sm mb-4">
            <span className="text-gold">{session.user.email}</span> isn't on the admin allowlist.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-gold underline hover:text-default"
          >
            Sign out and try another email
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center text-muted text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading…
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count: number; icon: JSX.Element }[] = [
    { id: "rsvps", label: "RSVPs", count: rsvps.length, icon: <Users className="w-3.5 h-3.5" /> },
    {
      id: "photos",
      label: "Photos",
      count: photos.length,
      icon: <ImageIcon className="w-3.5 h-3.5" />,
    },
    { id: "videos", label: "Videos", count: videos.length, icon: <Video className="w-3.5 h-3.5" /> },
    {
      id: "invites",
      label: "Invites",
      count: invites.length,
      icon: <Mail className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-2 text-faint text-xs tracking-wider uppercase">Signed in as</div>
        <div className="mb-8 text-default">{session.user.email}</div>

        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm tracking-wide transition-colors ${
                tab === t.id
                  ? "border-[color:var(--c-gold-bright)] text-default"
                  : "border-transparent text-muted hover:text-default"
              }`}
            >
              {t.icon}
              {t.label}
              <span className="text-gold-bright text-xs">{t.count}</span>
            </button>
          ))}
        </div>

        {tab === "rsvps" && <RsvpsTable rsvps={rsvps} />}
        {tab === "photos" && <PhotosTable photos={photos} onDelete={deletePhoto} />}
        {tab === "videos" && <VideosTable videos={videos} onDelete={deleteVideo} />}
        {tab === "invites" && (
          <InvitesTab
            invites={invites}
            broadcasts={broadcasts}
            reload={loadAll}
            session={session}
          />
        )}
      </div>
    </section>
  );
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    toast.error("Nothing to export.");
    return;
  }
  const headers = Array.from(
    rows.reduce<Set<string>>((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set()),
  );
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function RsvpsTable({ rsvps }: { rsvps: RsvpRow[] }) {
  const totalGuests = useMemo(
    () => rsvps.filter((r) => !r.not_attending).reduce((s, r) => s + (r.party_size || 0), 0),
    [rsvps],
  );
  const regrets = useMemo(() => rsvps.filter((r) => r.not_attending).length, [rsvps]);

  const exportCsv = () => {
    const rows = rsvps.map((r) => {
      const flat: Record<string, unknown> = {
        full_name: r.full_name,
        email: r.email,
        phone: r.phone,
        party_size: r.party_size,
        not_attending: r.not_attending,
        dietary_notes: r.dietary_notes,
        message: r.message,
        created_at: r.created_at,
      };
      for (const e of ALL_EVENTS) {
        flat[`event__${e.id}`] = r.attendance?.[e.id] ? "yes" : "";
      }
      return flat;
    });
    downloadCsv(`shelly-rsvps-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-muted text-sm">
          <span className="text-default font-medium">{totalGuests}</span> guests coming ·{" "}
          <span className="text-default font-medium">{regrets}</span> regrets ·{" "}
          <span className="text-default font-medium">{rsvps.length}</span> total submissions
        </div>
        <Button
          onClick={exportCsv}
          variant="outline"
          className="border-line-strong text-default hover:bg-gold-soft hover:text-strong"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {rsvps.length === 0 ? (
        <Empty label="No RSVPs yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-gold-soft text-muted text-xs uppercase tracking-wider">
              <tr>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>Party</Th>
                <Th>Events</Th>
                <Th>Notes</Th>
                <Th>When</Th>
              </tr>
            </thead>
            <tbody className="text-default">
              {rsvps.map((r) => {
                const attendingEvents = ALL_EVENTS.filter((e) => r.attendance?.[e.id]);
                return (
                  <tr key={r.id} className="border-t border-line align-top">
                    <Td>
                      <div className="font-medium">{r.full_name}</div>
                      {r.not_attending && (
                        <div className="text-danger text-xs mt-0.5">Can't make it</div>
                      )}
                    </Td>
                    <Td>
                      {r.email && <div className="text-xs">{r.email}</div>}
                      {r.phone && <div className="text-xs text-muted">{r.phone}</div>}
                    </Td>
                    <Td>{r.party_size}</Td>
                    <Td>
                      {r.not_attending ? (
                        <span className="text-faint text-xs">—</span>
                      ) : attendingEvents.length === 0 ? (
                        <span className="text-faint text-xs">No events checked</span>
                      ) : (
                        <div className="text-xs space-y-0.5">
                          {attendingEvents.slice(0, 4).map((e) => (
                            <div key={e.id}>{e.label}</div>
                          ))}
                          {attendingEvents.length > 4 && (
                            <div className="text-muted">+{attendingEvents.length - 4} more</div>
                          )}
                        </div>
                      )}
                    </Td>
                    <Td>
                      {r.dietary_notes && (
                        <div className="text-xs italic text-muted">{r.dietary_notes}</div>
                      )}
                      {r.message && <div className="text-xs text-muted mt-1">{r.message}</div>}
                    </Td>
                    <Td>
                      <div className="text-xs text-muted">
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PhotosTable({
  photos,
  onDelete,
}: {
  photos: PhotoRow[];
  onDelete: (p: PhotoRow) => Promise<void>;
}) {
  const exportCsv = () =>
    downloadCsv(
      `shelly-photos-${new Date().toISOString().slice(0, 10)}.csv`,
      photos.map((p) => ({ ...p })),
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-muted text-sm">
          <span className="text-default font-medium">{photos.length}</span> photos uploaded
        </div>
        <Button
          onClick={exportCsv}
          variant="outline"
          className="border-line-strong text-default hover:bg-gold-soft hover:text-strong"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {photos.length === 0 ? (
        <Empty label="No photos uploaded yet." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p) => {
            const url = supabase.storage.from("shelly-photos").getPublicUrl(p.storage_path).data
              .publicUrl;
            return (
              <div
                key={p.id}
                className="rounded-xl border border-line bg-surface-1 overflow-hidden group relative"
              >
                <button
                  type="button"
                  onClick={() => onDelete(p)}
                  aria-label="Delete photo"
                  title="Delete permanently"
                  className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <a href={url} target="_blank" rel="noreferrer" className="block">
                  <img src={url} alt={p.caption ?? ""} loading="lazy" className="w-full block" />
                </a>
                <div className="p-3 text-xs space-y-1">
                  {p.caption && <p className="text-default">{p.caption}</p>}
                  <p className="text-muted">
                    {p.uploader_name || <em className="text-faint">unsigned</em>}
                    {p.photo_year && <span> · {p.photo_year}</span>}
                  </p>
                  {p.uploader_email && <p className="text-faint truncate">{p.uploader_email}</p>}
                  <p className="text-faint">{new Date(p.created_at).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VideosTable({
  videos,
  onDelete,
}: {
  videos: VideoRow[];
  onDelete: (v: VideoRow) => Promise<void>;
}) {
  const exportCsv = () =>
    downloadCsv(
      `shelly-videos-${new Date().toISOString().slice(0, 10)}.csv`,
      videos.map((v) => ({ ...v })),
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-muted text-sm">
          <span className="text-default font-medium">{videos.length}</span> video messages
        </div>
        <Button
          onClick={exportCsv}
          variant="outline"
          className="border-line-strong text-default hover:bg-gold-soft hover:text-strong"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {videos.length === 0 ? (
        <Empty label="No video messages yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((v) => {
            const url = supabase.storage.from("shelly-videos").getPublicUrl(v.storage_path).data
              .publicUrl;
            return (
              <div
                key={v.id}
                className="rounded-xl border border-line bg-surface-1 overflow-hidden relative group"
              >
                <button
                  type="button"
                  onClick={() => onDelete(v)}
                  aria-label="Delete video"
                  title="Delete permanently"
                  className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <video
                  src={url}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full aspect-video bg-black"
                />
                <div className="p-3 text-xs space-y-1">
                  <p className="text-default font-medium">{v.full_name}</p>
                  {v.caption && <p className="text-muted">{v.caption}</p>}
                  {v.email && <p className="text-faint truncate">{v.email}</p>}
                  <p className="text-faint">{new Date(v.created_at).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Invites ------------------------------------------------------------------

const INVITE_TEMPLATES: Record<string, { subject: string; html: string }> = {
  invite: {
    subject: "You're invited to Shelly's Golden Glam 50th",
    html: `<p>Hi {{first_name}},</p>
<p>Robert and I (well, mostly Robert) are throwing a week of celebrations in Bend, Oregon for my <strong>50th birthday</strong> — <strong>June 9 – 15, 2026</strong> — and we'd love for you to be there.</p>
<p>Come for one dinner, a hike, the Brunch Bash, or the whole week. The full schedule, dress code for the Sunday Brunch, and an RSVP form (per event) are here:</p>
<p><a href="{{site_url}}" style="display:inline-block;padding:12px 22px;background:#d4a93e;color:#1a1410;border-radius:999px;text-decoration:none;font-weight:600">View invite &amp; RSVP →</a></p>
<p>You can also record a quick birthday video message or upload a favorite photo of me through the years for our slideshow.</p>
<p>Hope to see you there ✨</p>
<p style="color:#888">— Shelly &amp; Robert</p>`,
  },
  update: {
    subject: "Quick update on Shelly's 50th",
    html: `<p>Hi {{first_name}},</p>
<p>Just a quick update on the June 9 – 15 birthday plans:</p>
<p><em>Write your update here…</em></p>
<p>Need to change your RSVP or check the schedule? It's all at:<br/>
<a href="{{site_url}}">{{site_url}}</a></p>
<p style="color:#888">— Shelly &amp; Robert</p>`,
  },
  blank: {
    subject: "",
    html: "",
  },
};

function parseBulkInvites(raw: string): { email: string; name: string | null }[] {
  const out: { email: string; name: string | null }[] = [];
  const seen = new Set<string>();
  // Split on commas, semicolons, and newlines.
  const lines = raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const line of lines) {
    // Match "Name <email>" or bare email.
    const angle = line.match(/^\s*(.+?)\s*<\s*([^>\s]+@[^>\s]+)\s*>\s*$/);
    let name: string | null = null;
    let email: string;
    if (angle) {
      name = angle[1].replace(/^["']|["']$/g, "").trim() || null;
      email = angle[2];
    } else {
      email = line;
    }
    const lower = email.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    if (seen.has(lower)) continue;
    seen.add(lower);
    out.push({ email: lower, name });
  }
  return out;
}

function InvitesTab({
  invites,
  broadcasts,
  reload,
  session,
}: {
  invites: InviteRow[];
  broadcasts: BroadcastRow[];
  reload: () => Promise<void>;
  session: Session;
}) {
  const [bulkText, setBulkText] = useState("");
  const [adding, setAdding] = useState(false);

  const [template, setTemplate] = useState<keyof typeof INVITE_TEMPLATES>("invite");
  const [subject, setSubject] = useState(INVITE_TEMPLATES.invite.subject);
  const [html, setHtml] = useState(INVITE_TEMPLATES.invite.html);
  const [sending, setSending] = useState(false);
  const [sendingPreview, setSendingPreview] = useState(false);

  const previewParsed = useMemo(() => parseBulkInvites(bulkText), [bulkText]);

  const addBulk = async () => {
    if (previewParsed.length === 0) {
      toast.error("Paste at least one email address.");
      return;
    }
    setAdding(true);
    const { error } = await supabase
      .from("shelly_invites")
      .upsert(previewParsed, { onConflict: "email", ignoreDuplicates: true });
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Added up to ${previewParsed.length} invitees.`);
    setBulkText("");
    void reload();
  };

  const removeInvite = async (inv: InviteRow) => {
    if (!window.confirm(`Remove ${inv.email} from the invite list?`)) return;
    const { error } = await supabase.from("shelly_invites").delete().eq("id", inv.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removed.");
    void reload();
  };

  const applyTemplate = (key: keyof typeof INVITE_TEMPLATES) => {
    setTemplate(key);
    const t = INVITE_TEMPLATES[key];
    setSubject(t.subject);
    setHtml(t.html);
  };

  const callBroadcast = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("send-shelly-broadcast", {
      body: payload,
    });
    if (error) throw error;
    return data as { ok: boolean; sent: number; failed: number; failures?: { email: string; reason: string }[] };
  };

  const sendPreview = async () => {
    if (!subject.trim() || !html.trim()) {
      toast.error("Add a subject and a body first.");
      return;
    }
    setSendingPreview(true);
    try {
      const res = await callBroadcast({ subject, html, preview_to: session.user.email });
      if (res.failed > 0) {
        toast.error(`Preview failed: ${res.failures?.[0]?.reason ?? "unknown"}`);
      } else {
        toast.success(`Preview sent to ${session.user.email}.`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSendingPreview(false);
    }
  };

  const sendAll = async () => {
    if (!subject.trim() || !html.trim()) {
      toast.error("Add a subject and a body first.");
      return;
    }
    if (invites.length === 0) {
      toast.error("No invitees yet — paste some emails above first.");
      return;
    }
    if (
      !window.confirm(
        `Send this message to ${invites.length} invitee${invites.length === 1 ? "" : "s"}? This sends real emails.`,
      )
    )
      return;
    setSending(true);
    try {
      const res = await callBroadcast({ subject, html });
      if (res.failed > 0) {
        toast.error(`Sent ${res.sent}, failed ${res.failed}. See console for details.`);
        console.warn("Broadcast failures:", res.failures);
      } else {
        toast.success(`Sent to ${res.sent} ${res.sent === 1 ? "person" : "people"}.`);
      }
      void reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Bulk add */}
      <section className="rounded-2xl border border-line bg-surface-1 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <UserPlus className="w-4 h-4 text-gold-bright" />
          <h2 className="text-default font-medium">Add invitees</h2>
        </div>
        <p className="text-muted text-xs mb-4">
          Paste emails (one per line, or comma/semicolon separated). Accepts{" "}
          <code className="text-default">name@example.com</code> or{" "}
          <code className="text-default">Sam Rivera &lt;sam@example.com&gt;</code>. Duplicates are
          ignored.
        </p>
        <Textarea
          rows={4}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={"sam@example.com\nJordan Rivera <jordan@example.com>\nkim@example.com"}
          className="bg-page border-line-strong text-strong placeholder:text-faint focus-visible:ring-gold font-mono text-sm"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-faint text-xs">
            {previewParsed.length} valid {previewParsed.length === 1 ? "address" : "addresses"}{" "}
            detected.
          </p>
          <Button
            onClick={addBulk}
            disabled={adding || previewParsed.length === 0}
            className="bg-cta hover:bg-cta-hover font-medium rounded-full"
          >
            {adding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add to invite list
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Invitee list */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-muted text-sm">
            <span className="text-default font-medium">{invites.length}</span>{" "}
            {invites.length === 1 ? "invitee" : "invitees"} on the list
          </div>
        </div>
        {invites.length === 0 ? (
          <Empty label="No invitees yet. Paste some emails above to get started." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-gold-soft text-muted text-xs uppercase tracking-wider">
                <tr>
                  <Th>Email</Th>
                  <Th>Name</Th>
                  <Th>Added</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody className="text-default">
                {invites.map((inv) => (
                  <tr key={inv.id} className="border-t border-line align-top">
                    <Td>{inv.email}</Td>
                    <Td>{inv.name || <span className="text-faint">—</span>}</Td>
                    <Td>
                      <span className="text-xs text-muted">
                        {new Date(inv.added_at).toLocaleDateString()}
                      </span>
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => removeInvite(inv)}
                        title="Remove from list"
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-muted hover:text-danger hover:bg-gold-soft transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Compose */}
      <section className="rounded-2xl border border-line bg-surface-1 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Send className="w-4 h-4 text-gold-bright" />
          <h2 className="text-default font-medium">Send a message</h2>
        </div>
        <p className="text-muted text-xs mb-4">
          Sends one personalized email per invitee from{" "}
          <code className="text-default">notifications@grandrei.com</code>. Variables:{" "}
          <code className="text-default">{"{{first_name}}"}</code>,{" "}
          <code className="text-default">{"{{name}}"}</code>,{" "}
          <code className="text-default">{"{{email}}"}</code>,{" "}
          <code className="text-default">{"{{site_url}}"}</code>.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["invite", "update", "blank"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => applyTemplate(k)}
              className={`px-3 py-1.5 rounded-full text-xs tracking-wide border transition-colors ${
                template === k
                  ? "border-[color:var(--c-gold-bright)] bg-gold-soft text-default"
                  : "border-line-strong text-muted hover:text-default hover:bg-gold-soft"
              }`}
            >
              {k === "invite" ? "Initial invite" : k === "update" ? "Update" : "Blank"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-muted text-xs tracking-wide uppercase">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-page border-line-strong text-strong placeholder:text-faint focus-visible:ring-gold"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted text-xs tracking-wide uppercase">Body (HTML)</Label>
            <Textarea
              rows={12}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="bg-page border-line-strong text-strong placeholder:text-faint focus-visible:ring-gold font-mono text-xs"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={sendPreview}
            disabled={sendingPreview}
            className="border-line-strong text-default hover:bg-gold-soft hover:text-strong rounded-full"
          >
            {sendingPreview ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send preview to me
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={sendAll}
            disabled={sending || invites.length === 0}
            className="bg-cta hover:bg-cta-hover font-medium rounded-full"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {invites.length} {invites.length === 1 ? "invitee" : "invitees"}
              </>
            )}
          </Button>
        </div>
      </section>

      {/* History */}
      {broadcasts.length > 0 && (
        <section>
          <div className="text-muted text-sm mb-3">Recent sends</div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-gold-soft text-muted text-xs uppercase tracking-wider">
                <tr>
                  <Th>Subject</Th>
                  <Th>Recipients</Th>
                  <Th>Result</Th>
                  <Th>By</Th>
                  <Th>When</Th>
                </tr>
              </thead>
              <tbody className="text-default">
                {broadcasts.map((b) => (
                  <tr key={b.id} className="border-t border-line align-top">
                    <Td>
                      <div className="text-xs">{b.subject}</div>
                    </Td>
                    <Td>{b.recipient_count}</Td>
                    <Td>
                      <span className="text-default">{b.success_count} sent</span>
                      {b.failure_count > 0 && (
                        <span className="text-danger ml-1">· {b.failure_count} failed</span>
                      )}
                    </Td>
                    <Td>
                      <span className="text-xs text-muted">{b.sent_by_email}</span>
                    </Td>
                    <Td>
                      <span className="text-xs text-muted">
                        {new Date(b.sent_at).toLocaleString()}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
function Empty({ label }: { label: string }) {
  return (
    <div className="py-16 text-center text-muted text-sm rounded-xl border border-line">
      {label}
    </div>
  );
}
