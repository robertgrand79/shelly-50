import { Sparkles, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onRsvp: () => void;
}

export default function ShellyHero({ onRsvp }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* Radial gold glow background (theme-aware via CSS var) */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-hero-glow" />
      {/* Sparkle accents */}
      <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
        <div className="absolute top-20 left-[15%] w-1.5 h-1.5 rounded-full bg-[color:var(--c-gold-bright)] animate-pulse" />
        <div className="absolute top-40 right-[20%] w-1 h-1 rounded-full bg-[color:var(--c-gold)]" />
        <div className="absolute bottom-32 left-[25%] w-1 h-1 rounded-full bg-[color:var(--c-gold-bright)]" />
        <div className="absolute top-60 right-[35%] w-2 h-2 rounded-full bg-gold-medium animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-3xl bg-gold-medium blur-2xl"
            />
            <img
              src="/shelly-hero.jpg"
              alt="Shelly in a gold gown riding a winged white bison through golden sunset clouds, raising a glass beneath a sparkling 'Happy 50th Birthday, Shelly!' marquee."
              width={1499}
              height={2000}
              loading="eager"
              fetchPriority="high"
              className="relative w-[260px] sm:w-[320px] md:w-[360px] rounded-2xl ring-1 ring-[color:var(--c-gold-bright)] shadow-portrait"
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-line-strong bg-gold-soft text-default text-xs sm:text-sm tracking-[0.2em] uppercase mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          You're invited
        </div>

        <h1
          className="font-serif font-light text-strong leading-[1.05] tracking-tight mb-6"
          style={{
            fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
            fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
          }}
        >
          Shelly's
          <span className="block italic font-normal gradient-gold-text">
            Golden Glam 50th
          </span>
        </h1>

        <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto mb-2">
          Half a century of fabulous — celebrated in the mountains.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-muted text-sm sm:text-base">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-bright" />
            June 9 – 15, 2026
          </span>
          <span className="hidden sm:inline text-faint">•</span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold-bright" />
            Bend & Sunriver, Oregon
          </span>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={onRsvp}
            size="lg"
            className="bg-cta hover:bg-cta-hover font-medium px-8 py-6 text-base rounded-full shadow-cta hover:shadow-cta transition-all"
          >
            RSVP Now
          </Button>
          <a
            href="#schedule"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 rounded-full border border-line-strong text-default hover:bg-gold-soft transition-colors text-sm tracking-wide"
          >
            See the Schedule
          </a>
        </div>

        <p className="mt-10 max-w-xl mx-auto text-xs sm:text-sm text-faint tracking-wide">
          ✨ Dress code for Sunday's Brunch Bash: <em>Silver, White, or Gold</em>
        </p>
      </div>
    </section>
  );
}
