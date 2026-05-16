import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/pages/shelly/sections/ShellySchedule";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  year: string;
}

const MAX_FILES = 20;
const MAX_BYTES_PER_FILE = 15 * 1024 * 1024; // 15 MB per photo

export default function ShellyPhotoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [uploaderName, setUploaderName] = useState("");
  const [uploaderEmail, setUploaderEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const available = MAX_FILES - photos.length;
    if (available <= 0) {
      toast.error(`Max ${MAX_FILES} photos at a time. Submit this batch and add more after.`);
      return;
    }
    const accepted: PhotoItem[] = [];
    for (const f of files.slice(0, available)) {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} isn't an image, skipping.`);
        continue;
      }
      if (f.size > MAX_BYTES_PER_FILE) {
        toast.error(`${f.name} is too large (max 15 MB).`);
        continue;
      }
      accepted.push({
        id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        caption: "",
        year: "",
      });
    }
    setPhotos((p) => [...p, ...accepted]);
  };

  const removePhoto = (id: string) => {
    setPhotos((p) => {
      const removed = p.find((x) => x.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return p.filter((x) => x.id !== id);
    });
  };

  const updatePhoto = (id: string, patch: Partial<PhotoItem>) => {
    setPhotos((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const uploadAll = async () => {
    if (photos.length === 0) {
      toast.error("Add at least one photo first.");
      return;
    }
    setUploading(true);

    const safeName =
      (uploaderName.trim() || "guest").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 30) || "guest";

    let successCount = 0;
    for (const photo of photos) {
      const extMatch = photo.file.name.match(/\.([a-z0-9]+)$/i);
      const ext = (extMatch?.[1] || "jpg").toLowerCase();
      const path = `${safeName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("shelly-photos")
        .upload(path, photo.file, { contentType: photo.file.type, upsert: false });
      if (upErr) {
        console.error(upErr);
        toast.error(`Failed to upload ${photo.file.name}`);
        continue;
      }
      const parsedYear = photo.year.trim() ? parseInt(photo.year, 10) : null;
      const yearValid = parsedYear !== null && !Number.isNaN(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100;
      const { error: insErr } = await supabase.from("shelly_photos").insert({
        uploader_name: uploaderName.trim() || null,
        uploader_email: uploaderEmail.trim() || null,
        storage_path: path,
        caption: photo.caption.trim() || null,
        photo_year: yearValid ? parsedYear : null,
      });
      if (insErr) {
        console.error(insErr);
        continue;
      }
      successCount += 1;
    }

    setUploading(false);
    if (successCount > 0) {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPhotos([]);
      setSubmittedCount((c) => c + successCount);
      toast.success(`${successCount} photo${successCount === 1 ? "" : "s"} sent to Shelly's collection!`);
    }
  };

  return (
    <section id="photos" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-line">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          eyebrow="Photo Memories"
          title="Shelly Through the Years"
          subtitle="Have a favorite photo of Shelly? Childhood, college, weddings, road trips — share whatever you've got. We're putting together a slideshow for the Brunch Bash."
        />

        {submittedCount > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-gold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            {submittedCount} photo{submittedCount === 1 ? "" : "s"} already shared — thank you!
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-line bg-surface-1 p-6 sm:p-8">
          {/* Your info */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <Label className="text-muted text-xs tracking-wide uppercase">Your name (optional)</Label>
              <Input
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                placeholder="So we can credit you"
                className="bg-page border-line-strong text-strong placeholder:text-faint focus-visible:ring-gold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted text-xs tracking-wide uppercase">Email (optional)</Label>
              <Input
                type="email"
                value={uploaderEmail}
                onChange={(e) => setUploaderEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-page border-line-strong text-strong placeholder:text-faint focus-visible:ring-gold"
              />
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed transition-all px-6 py-12 text-center ${
              dragOver
                ? "border-[color:var(--c-gold-bright)] bg-gold-soft"
                : "border-line-strong hover:border-line-strong hover:bg-gold-soft"
            }`}
          >
            <Upload className="w-10 h-10 text-gold-bright mx-auto mb-3" />
            <p className="text-default font-medium mb-1">Drop photos here or click to browse</p>
            <p className="text-muted text-xs">
              JPG, PNG, HEIC — up to {MAX_FILES} photos at a time, 15 MB each
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* Thumbnails */}
          {photos.length > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-xl border border-line bg-page overflow-hidden"
                >
                  <div className="relative aspect-square bg-black">
                    <img
                      src={photo.previewUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                      aria-label="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <Textarea
                      value={photo.caption}
                      onChange={(e) => updatePhoto(photo.id, { caption: e.target.value })}
                      rows={2}
                      placeholder="Caption (optional)"
                      className="bg-transparent border-line text-strong placeholder:text-faint focus-visible:ring-gold text-xs resize-none"
                    />
                    <Input
                      value={photo.year}
                      onChange={(e) => updatePhoto(photo.id, { year: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) })}
                      placeholder="Year"
                      inputMode="numeric"
                      className="bg-transparent border-line text-strong placeholder:text-faint focus-visible:ring-gold text-xs h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {photos.length > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <Button
                type="button"
                onClick={uploadAll}
                disabled={uploading}
                size="lg"
                className="bg-cta hover:bg-cta-hover font-medium px-10 py-6 rounded-full shadow-cta"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading {photos.length} photo{photos.length === 1 ? "" : "s"}…
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Share {photos.length} photo{photos.length === 1 ? "" : "s"}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
