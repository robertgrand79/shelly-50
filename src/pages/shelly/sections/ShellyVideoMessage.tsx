import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader } from "@/pages/shelly/sections/ShellySchedule";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Video, Square, Upload, RotateCcw, CheckCircle2, Loader2, Film } from "lucide-react";
import { toast } from "sonner";

type Mode = "idle" | "recording" | "preview-recorded" | "preview-uploaded";

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB cap to keep storage costs sane

export default function ShellyVideoMessage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingMs, setRecordingMs] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      // Choose the best supported mime
      const mimeCandidates = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ];
      const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });
        setBlob(recordedBlob);
        const url = URL.createObjectURL(recordedBlob);
        setPreviewUrl(url);
        cleanupStream();
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
          videoRef.current.muted = false;
          videoRef.current.controls = true;
        }
        setMode("preview-recorded");
      };
      recorder.start();
      setMode("recording");
      setRecordingMs(0);
      const startedAt = Date.now();
      const tick = setInterval(() => {
        if (recorderRef.current?.state !== "recording") {
          clearInterval(tick);
          return;
        }
        setRecordingMs(Date.now() - startedAt);
      }, 200);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't access your camera. Check browser permissions or upload a video file instead.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setBlob(null);
    setPreviewUrl(null);
    setMode("idle");
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = "";
      videoRef.current.controls = false;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Video is too large. Please keep it under 200 MB.");
      return;
    }
    setBlob(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.muted = false;
      videoRef.current.controls = true;
    }
    setMode("preview-uploaded");
  };

  const upload = async () => {
    if (!blob) return;
    if (!name.trim()) {
      toast.error("Please add your name so Shelly knows who it's from.");
      return;
    }
    if (blob.size > MAX_BYTES) {
      toast.error("Video is too large. Please keep it under 200 MB.");
      return;
    }
    setUploading(true);
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    const safeName = name.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40) || "guest";
    const path = `${safeName}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("shelly-videos")
      .upload(path, blob, {
        contentType: blob.type || "video/webm",
        upsert: false,
      });

    if (upErr) {
      console.error(upErr);
      setUploading(false);
      toast.error("Upload failed. Please try again or send the video to Robert directly.");
      return;
    }

    const { error: insertErr } = await supabase.from("shelly_video_messages").insert({
      full_name: name.trim(),
      email: email.trim() || null,
      storage_path: path,
      mime_type: blob.type || null,
      size_bytes: blob.size,
      caption: caption.trim() || null,
    });

    setUploading(false);
    if (insertErr) {
      console.error(insertErr);
      toast.error("Your video uploaded but we couldn't save the details. Robert will follow up.");
      return;
    }
    setSubmitted(true);
    toast.success("Video message sent — Shelly's going to love it 🎬");
  };

  const seconds = Math.floor(recordingMs / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  if (submitted) {
    return (
      <section id="video" className="py-20 px-4 sm:px-6 border-t border-line">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-medium border border-line-strong mb-6">
            <CheckCircle2 className="w-8 h-8 text-gold" />
          </div>
          <h2
            className="font-serif text-3xl sm:text-4xl text-strong mb-4"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            Video Sent!
          </h2>
          <p className="text-muted mb-6">
            Shelly will see your message at her Brunch Bash on June 14. Thank you for making her day extra special.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              setName("");
              setEmail("");
              setCaption("");
              setSubmitted(false);
            }}
            className="border-line-strong text-default bg-transparent hover:bg-gold-soft hover:text-default"
          >
            Send another video
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="video" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-line">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          eyebrow="Video Messages"
          title="Wish Shelly a Happy Birthday"
          subtitle="Record a quick message right here, or upload a video from your phone. We'll play them at Sunday's Brunch Bash."
        />

        <div className="mt-12 rounded-2xl border border-line bg-surface-1 p-6 sm:p-8">
          {/* Video preview / camera */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-line mb-5">
            <video
              ref={videoRef}
              playsInline
              className="w-full h-full object-cover"
            />
            {mode === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted gap-2">
                <Film className="w-12 h-12 text-gold-bright/40" />
                <p className="text-sm">Press record or upload a file to get started</p>
              </div>
            )}
            {mode === "recording" && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                REC {mm}:{ss}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 justify-center">
            {mode === "idle" && (
              <>
                <Button
                  type="button"
                  onClick={startRecording}
                  className="bg-cta hover:bg-cta-hover font-medium rounded-full"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Record video
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-line-strong text-default bg-transparent hover:bg-gold-soft hover:text-default rounded-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload a video
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] || null)}
                />
              </>
            )}
            {mode === "recording" && (
              <Button
                type="button"
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full"
              >
                <Square className="w-4 h-4 mr-2" fill="currentColor" />
                Stop recording
              </Button>
            )}
            {(mode === "preview-recorded" || mode === "preview-uploaded") && (
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                className="border-line-strong text-default bg-transparent hover:bg-gold-soft hover:text-default rounded-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start over
              </Button>
            )}
          </div>

          {/* Submission form once we have a video */}
          {(mode === "preview-recorded" || mode === "preview-uploaded") && (
            <div className="mt-8 pt-8 border-t border-line space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-muted text-xs tracking-wide uppercase">
                    Your name <span className="text-gold-bright">*</span>
                  </Label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Who's this from?"
                    className="bg-page border-line-strong text-strong placeholder:text-faint focus-visible:ring-gold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted text-xs tracking-wide uppercase">Email (optional)</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-page border-line-strong text-strong placeholder:text-faint focus-visible:ring-gold"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted text-xs tracking-wide uppercase">Caption (optional)</Label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  placeholder="A note to play alongside your message"
                  className="bg-page border-line-strong text-strong placeholder:text-faint focus-visible:ring-gold"
                />
              </div>
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  onClick={upload}
                  disabled={uploading}
                  size="lg"
                  className="bg-cta hover:bg-cta-hover font-medium px-10 py-6 rounded-full shadow-cta"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    "Send Video Message"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
