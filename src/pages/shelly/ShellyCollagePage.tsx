import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "@/pages/shelly/Helmet";
import { Sparkles, ArrowLeft, ImageIcon, Video, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface PhotoRow {
  id: string;
  uploader_name: string | null;
  storage_path: string;
  caption: string | null;
  photo_year: number | null;
  created_at: string;
}

interface VideoRow {
  id: string;
  full_name: string;
  storage_path: string;
  mime_type: string | null;
  caption: string | null;
  created_at: string;
}

function publicUrl(bucket: "shelly-photos" | "shelly-videos", path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export default function ShellyCollagePage() {
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [photosRes, videosRes] = await Promise.all([
        supabase
          .from("shelly_photos")
          .select("id, uploader_name, storage_path, caption, photo_year, created_at")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("shelly_video_messages")
          .select("id, full_name, storage_path, mime_type, caption, created_at")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);
      if (cancelled) return;
      if (photosRes.error) setError(photosRes.error.message);
      else setPhotos((photosRes.data ?? []) as PhotoRow[]);
      if (videosRes.error && !photosRes.error) setError(videosRes.error.message);
      else if (!videosRes.error) setVideos((videosRes.data ?? []) as VideoRow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const photoCount = photos.length;
  const videoCount = videos.length;

  return (
    <div className="min-h-screen bg-page text-strong font-sans">
      <Helmet
        title="Shelly's Happy Birthday Wall — Photos & Videos"
        description="A growing collage of photos and birthday messages from everyone celebrating Shelly's 50th."
      />

      <header className="sticky top-0 z-40 backdrop-blur-md bg-page-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-serif text-default hover:text-default transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline tracking-wide">Back to RSVP</span>
            <span className="sm:hidden tracking-wide">RSVP</span>
          </Link>
          <div className="flex items-center gap-3 text-default text-sm tracking-wide">
            <Sparkles className="w-4 h-4 text-gold-bright" />
            <span className="hidden sm:inline">Happy Birthday Wall</span>
            <span className="sm:hidden">Wall</span>
            <ThemeToggle className="ml-1" />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-collage-glow" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-line-strong bg-gold-soft text-default text-xs sm:text-sm tracking-[0.2em] uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Happy Birthday Wall
          </div>
          <h1
            className="font-serif font-light text-strong leading-[1.05] tracking-tight mb-4"
            style={{
              fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
              fontSize: "clamp(2.25rem, 6vw, 4rem)",
            }}
          >
            Shelly Through{" "}
            <span className="italic font-normal gradient-gold-text">
              the Years
            </span>
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
            Photos, video birthday messages, and memories from everyone celebrating with us.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted text-sm">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gold-bright" />
              {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </span>
            <span className="text-faint">•</span>
            <span className="flex items-center gap-2">
              <Video className="w-4 h-4 text-gold-bright" />
              {videoCount} {videoCount === 1 ? "video" : "videos"}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/#photos"
              className="px-6 py-3 rounded-full bg-cta hover:bg-cta-hover font-medium text-sm tracking-wide shadow-cta transition-all"
            >
              Share a Photo
            </Link>
            <Link
              to="/#video"
              className="px-6 py-3 rounded-full border border-line-strong text-default hover:bg-gold-soft transition-colors text-sm tracking-wide"
            >
              Send a Video Message
            </Link>
          </div>
        </div>
      </section>

      {loading && (
        <div className="py-24 flex items-center justify-center text-muted text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading the wall…
        </div>
      )}

      {error && !loading && (
        <div className="py-16 text-center text-danger text-sm px-4">
          Couldn't load the gallery: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {videos.length > 0 && (
            <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-line">
              <div className="max-w-6xl mx-auto">
                <h2
                  className="font-serif text-2xl sm:text-3xl text-strong mb-2"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  Birthday Messages
                </h2>
                <p className="text-muted text-sm mb-8">
                  Recorded notes from friends and family.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {videos.map((v) => (
                    <VideoCard key={v.id} video={v} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {photos.length > 0 && (
            <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-line">
              <div className="max-w-6xl mx-auto">
                <h2
                  className="font-serif text-2xl sm:text-3xl text-strong mb-2"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  Photo Memories
                </h2>
                <p className="text-muted text-sm mb-8">
                  {photoCount} {photoCount === 1 ? "memory" : "memories"} and counting.
                </p>
                <PhotoMasonry photos={photos} />
              </div>
            </section>
          )}

          {photos.length === 0 && videos.length === 0 && (
            <div className="py-24 text-center text-muted text-sm px-4">
              The wall is empty so far. Be the first to share something —{" "}
              <Link to="/#photos" className="underline hover:text-default">
                add a photo
              </Link>{" "}
              or{" "}
              <Link to="/#video" className="underline hover:text-default">
                record a message
              </Link>
              .
            </div>
          )}
        </>
      )}

      <footer className="py-12 px-4 text-center text-faint text-xs tracking-wide border-t border-line">
        For Shelly, with love.
      </footer>
    </div>
  );
}

function VideoCard({ video }: { video: VideoRow }) {
  const url = useMemo(() => publicUrl("shelly-videos", video.storage_path), [video.storage_path]);
  return (
    <div className="rounded-2xl border border-line bg-surface-1 overflow-hidden">
      <video
        src={url}
        controls
        preload="metadata"
        playsInline
        className="w-full aspect-video bg-black object-contain"
      />
      <div className="p-4">
        <p className="text-default text-sm font-medium">{video.full_name || "A friend"}</p>
        {video.caption && (
          <p className="text-muted text-xs mt-1 leading-relaxed">{video.caption}</p>
        )}
      </div>
    </div>
  );
}

function PhotoMasonry({ photos }: { photos: PhotoRow[] }) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
      {photos.map((p) => (
        <PhotoTile key={p.id} photo={p} />
      ))}
    </div>
  );
}

function PhotoTile({ photo }: { photo: PhotoRow }) {
  const url = useMemo(() => publicUrl("shelly-photos", photo.storage_path), [photo.storage_path]);
  const [loaded, setLoaded] = useState(false);
  const hasMeta = photo.caption || photo.uploader_name || photo.photo_year;

  return (
    <figure className="mb-4 break-inside-avoid rounded-xl overflow-hidden bg-surface-1 border border-line group">
      <div className="relative">
        <img
          src={url}
          alt={photo.caption ?? "Photo of Shelly"}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full block transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        {!loaded && <div className="absolute inset-0 bg-gold-soft animate-pulse" />}
      </div>
      {hasMeta && (
        <figcaption className="px-3 py-2.5 text-xs leading-relaxed">
          {photo.caption && (
            <p className="text-muted">{photo.caption}</p>
          )}
          <p className="text-faint mt-1">
            {photo.uploader_name && <span>{photo.uploader_name}</span>}
            {photo.uploader_name && photo.photo_year && <span className="mx-1.5">·</span>}
            {photo.photo_year && <span>{photo.photo_year}</span>}
          </p>
        </figcaption>
      )}
    </figure>
  );
}
