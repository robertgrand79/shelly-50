import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "@/pages/shelly/Helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { SCHEDULE } from "@/pages/shelly/schedule";

type Tab = "rsvps" | "photos" | "videos";

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
    <div className="min-h-screen bg-[#0d0a08] text-amber-50 font-sans">
      <Helmet title="Shelly 50th — Admin" />

      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0d0a08]/80 border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-amber-200 hover:text-amber-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="tracking-wide">Back to site</span>
          </Link>
          <div className="flex items-center gap-3 text-amber-200 text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="tracking-wide">Admin</span>
            {session && (
              <button
                onClick={() => supabase.auth.signOut()}
                className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-200/80 hover:text-amber-100 hover:bg-amber-500/10 text-xs"
              >
                <LogOut className="w-3 h-3" />
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      {bootstrapping ? (
        <div className="py-24 flex items-center justify-center text-amber-200/70 text-sm gap-2">
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
      <div className="max-w-md mx-auto rounded-2xl border border-amber-500/20 bg-white/[0.02] p-8 text-center">
        <Sparkles className="w-7 h-7 text-amber-400 mx-auto mb-4" />
        <h1
          className="font-serif text-3xl text-amber-50 mb-2"
          style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        >
          Admin sign-in
        </h1>
        <p className="text-amber-200/70 text-sm mb-6">
          Enter your admin email and we'll send you a sign-in link.
        </p>

        {sent ? (
          <div className="text-amber-100 text-sm">
            <Mail className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            Check <span className="text-amber-300">{email}</span> for a magic link. It expires in 1
            hour.
            <button
              onClick={() => setSent(false)}
              className="block mx-auto mt-4 text-xs text-amber-300/70 underline hover:text-amber-200"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <Label className="text-amber-200/80 text-xs tracking-wide uppercase">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="you@example.com"
              className="bg-[#0d0a08] border-amber-500/30 text-amber-50 placeholder:text-amber-200/30 focus-visible:ring-amber-400"
            />
            <Button
              onClick={send}
              disabled={sending || !email.trim()}
              className="w-full bg-gradient-to-br from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-[#0d0a08] font-medium rounded-full py-5"
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
            <p className="text-amber-300/50 text-[11px] mt-3 leading-relaxed">
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
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [rsvpsRes, photosRes, videosRes] = await Promise.all([
        supabase.from("shelly_rsvps").select("*").order("created_at", { ascending: false }),
        supabase.from("shelly_photos").select("*").order("created_at", { ascending: false }),
        supabase.from("shelly_video_messages").select("*").order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      // If everything returns 0 rows AND we expected data, likely RLS is blocking
      // (i.e. user is signed in but isn't on the admin allowlist).
      const allEmpty =
        (rsvpsRes.data?.length ?? 0) === 0 &&
        (photosRes.data?.length ?? 0) === 0 &&
        (videosRes.data?.length ?? 0) === 0;
      // We confirm admin status with a direct RPC check.
      const { data: isAdmin } = await supabase.rpc("is_shelly_admin");
      if (cancelled) return;
      if (!isAdmin) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      setRsvps((rsvpsRes.data ?? []) as RsvpRow[]);
      setPhotos((photosRes.data ?? []) as PhotoRow[]);
      setVideos((videosRes.data ?? []) as VideoRow[]);
      setLoading(false);
      void allEmpty;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (accessDenied) {
    return (
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-md mx-auto rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
          <ShieldAlert className="w-7 h-7 text-red-300 mx-auto mb-3" />
          <h2 className="text-amber-50 font-medium mb-1">Not authorized</h2>
          <p className="text-amber-200/70 text-sm mb-4">
            <span className="text-amber-300">{session.user.email}</span> isn't on the admin
            allowlist.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-amber-300/80 underline hover:text-amber-100"
          >
            Sign out and try another email
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center text-amber-200/70 text-sm gap-2">
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
  ];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-2 text-amber-300/60 text-xs tracking-wider uppercase">Signed in as</div>
        <div className="mb-8 text-amber-100">{session.user.email}</div>

        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-amber-500/15">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm tracking-wide transition-colors ${
                tab === t.id
                  ? "border-amber-400 text-amber-100"
                  : "border-transparent text-amber-200/60 hover:text-amber-100"
              }`}
            >
              {t.icon}
              {t.label}
              <span className="text-amber-400/80 text-xs">{t.count}</span>
            </button>
          ))}
        </div>

        {tab === "rsvps" && <RsvpsTable rsvps={rsvps} />}
        {tab === "photos" && <PhotosTable photos={photos} />}
        {tab === "videos" && <VideosTable videos={videos} />}
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
        <div className="text-amber-200/80 text-sm">
          <span className="text-amber-100 font-medium">{totalGuests}</span> guests coming ·{" "}
          <span className="text-amber-100 font-medium">{regrets}</span> regrets ·{" "}
          <span className="text-amber-100 font-medium">{rsvps.length}</span> total submissions
        </div>
        <Button
          onClick={exportCsv}
          variant="outline"
          className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:text-amber-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {rsvps.length === 0 ? (
        <Empty label="No RSVPs yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-amber-500/15">
          <table className="w-full text-sm">
            <thead className="bg-amber-500/5 text-amber-200/80 text-xs uppercase tracking-wider">
              <tr>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>Party</Th>
                <Th>Events</Th>
                <Th>Notes</Th>
                <Th>When</Th>
              </tr>
            </thead>
            <tbody className="text-amber-100">
              {rsvps.map((r) => {
                const attendingEvents = ALL_EVENTS.filter((e) => r.attendance?.[e.id]);
                return (
                  <tr key={r.id} className="border-t border-amber-500/10 align-top">
                    <Td>
                      <div className="font-medium">{r.full_name}</div>
                      {r.not_attending && (
                        <div className="text-red-300/80 text-xs mt-0.5">Can't make it</div>
                      )}
                    </Td>
                    <Td>
                      {r.email && <div className="text-xs">{r.email}</div>}
                      {r.phone && <div className="text-xs text-amber-200/70">{r.phone}</div>}
                    </Td>
                    <Td>{r.party_size}</Td>
                    <Td>
                      {r.not_attending ? (
                        <span className="text-amber-200/40 text-xs">—</span>
                      ) : attendingEvents.length === 0 ? (
                        <span className="text-amber-200/40 text-xs">No events checked</span>
                      ) : (
                        <div className="text-xs space-y-0.5">
                          {attendingEvents.slice(0, 4).map((e) => (
                            <div key={e.id}>{e.label}</div>
                          ))}
                          {attendingEvents.length > 4 && (
                            <div className="text-amber-300/70">
                              +{attendingEvents.length - 4} more
                            </div>
                          )}
                        </div>
                      )}
                    </Td>
                    <Td>
                      {r.dietary_notes && (
                        <div className="text-xs italic text-amber-200/80">{r.dietary_notes}</div>
                      )}
                      {r.message && (
                        <div className="text-xs text-amber-100/90 mt-1">{r.message}</div>
                      )}
                    </Td>
                    <Td>
                      <div className="text-xs text-amber-200/70">
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

function PhotosTable({ photos }: { photos: PhotoRow[] }) {
  const exportCsv = () =>
    downloadCsv(
      `shelly-photos-${new Date().toISOString().slice(0, 10)}.csv`,
      photos.map((p) => ({ ...p })),
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-amber-200/80 text-sm">
          <span className="text-amber-100 font-medium">{photos.length}</span> photos uploaded
        </div>
        <Button
          onClick={exportCsv}
          variant="outline"
          className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:text-amber-50"
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
                className="rounded-xl border border-amber-500/15 bg-white/[0.02] overflow-hidden"
              >
                <a href={url} target="_blank" rel="noreferrer" className="block">
                  <img src={url} alt={p.caption ?? ""} loading="lazy" className="w-full block" />
                </a>
                <div className="p-3 text-xs space-y-1">
                  {p.caption && <p className="text-amber-100">{p.caption}</p>}
                  <p className="text-amber-200/70">
                    {p.uploader_name || <em className="text-amber-200/40">unsigned</em>}
                    {p.photo_year && <span> · {p.photo_year}</span>}
                  </p>
                  {p.uploader_email && (
                    <p className="text-amber-300/60 truncate">{p.uploader_email}</p>
                  )}
                  <p className="text-amber-300/40">{new Date(p.created_at).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VideosTable({ videos }: { videos: VideoRow[] }) {
  const exportCsv = () =>
    downloadCsv(
      `shelly-videos-${new Date().toISOString().slice(0, 10)}.csv`,
      videos.map((v) => ({ ...v })),
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-amber-200/80 text-sm">
          <span className="text-amber-100 font-medium">{videos.length}</span> video messages
        </div>
        <Button
          onClick={exportCsv}
          variant="outline"
          className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:text-amber-50"
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
                className="rounded-xl border border-amber-500/15 bg-white/[0.02] overflow-hidden"
              >
                <video
                  src={url}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full aspect-video bg-black"
                />
                <div className="p-3 text-xs space-y-1">
                  <p className="text-amber-100 font-medium">{v.full_name}</p>
                  {v.caption && <p className="text-amber-200/80">{v.caption}</p>}
                  {v.email && <p className="text-amber-300/60 truncate">{v.email}</p>}
                  <p className="text-amber-300/40">{new Date(v.created_at).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
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
    <div className="py-16 text-center text-amber-200/60 text-sm rounded-xl border border-amber-500/15">
      {label}
    </div>
  );
}
