import { Sparkles, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onRsvp: () => void;
}

export default function ShellyHero({ onRsvp }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* Radial gold glow background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(245, 197, 100, 0.25), transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(180, 140, 60, 0.18), transparent 55%), linear-gradient(180deg, #1a1410 0%, #0d0a08 100%)",
        }}
      />
      {/* Sparkle accents */}
      <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-20 left-[15%] w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
        <div className="absolute top-40 right-[20%] w-1 h-1 rounded-full bg-amber-200" />
        <div className="absolute bottom-32 left-[25%] w-1 h-1 rounded-full bg-amber-300" />
        <div className="absolute top-60 right-[35%] w-2 h-2 rounded-full bg-amber-400/60 animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs sm:text-sm tracking-[0.2em] uppercase mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          You're invited
        </div>

        <h1
          className="font-serif font-light text-amber-50 leading-[1.05] tracking-tight mb-6"
          style={{
            fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
            fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
          }}
        >
          Shelly's
          <span
            className="block italic font-normal"
            style={{
              background: "linear-gradient(135deg, #f5e7a8 0%, #d4a93e 50%, #f5e7a8 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Golden Glam 50th
          </span>
        </h1>

        <p className="text-amber-100/80 text-base sm:text-lg max-w-2xl mx-auto mb-2">
          Half a century of fabulous — celebrated in the mountains.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-amber-200/90 text-sm sm:text-base">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            June 9 – 15, 2026
          </span>
          <span className="hidden sm:inline text-amber-500/40">•</span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Bend & Sunriver, Oregon
          </span>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={onRsvp}
            size="lg"
            className="bg-gradient-to-br from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-[#0d0a08] font-medium px-8 py-6 text-base rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-400/50 transition-all"
          >
            RSVP Now
          </Button>
          <a
            href="#schedule"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 rounded-full border border-amber-500/40 text-amber-200 hover:bg-amber-500/10 transition-colors text-sm tracking-wide"
          >
            See the Schedule
          </a>
        </div>

        <p className="mt-10 max-w-xl mx-auto text-xs sm:text-sm text-amber-300/60 tracking-wide">
          ✨ Dress code for Sunday's Brunch Bash: <em>Silver, White, or Gold</em>
        </p>
      </div>
    </section>
  );
}
