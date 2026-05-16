import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "@/pages/shelly/Helmet";
import ShellyHero from "@/pages/shelly/sections/ShellyHero";
import ShellySchedule from "@/pages/shelly/sections/ShellySchedule";
import ShellyRsvpForm from "@/pages/shelly/sections/ShellyRsvpForm";
import ShellyVideoMessage from "@/pages/shelly/sections/ShellyVideoMessage";
import ShellyPhotoUpload from "@/pages/shelly/sections/ShellyPhotoUpload";
import ShellyFooter from "@/pages/shelly/sections/ShellyFooter";
import ThemeToggle from "@/components/ThemeToggle";
import { Sparkles } from "lucide-react";

const navItems = [
  { id: "schedule", label: "Schedule" },
  { id: "rsvp", label: "RSVP" },
  { id: "video", label: "Video Message" },
  { id: "photos", label: "Photo Memories" },
];

export default function ShellyBirthdayPage() {
  const [active, setActive] = useState<string>("");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-page text-strong font-sans">
      <Helmet
        title="Shelly's Golden Glam 50th — RSVP"
        description="Join us June 9–15, 2026 in Bend & Sunriver, Oregon to celebrate Shelly's 50th. RSVP, send a video message, and share photos through the years."
      />

      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-page-blur border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 font-serif text-default hover:text-default transition-colors"
          >
            <Sparkles className="w-4 h-4 text-gold-bright" />
            <span className="hidden sm:inline tracking-wide">Shelly's Golden 50th</span>
            <span className="sm:hidden tracking-wide">Shelly 50</span>
          </a>
          <nav className="flex items-center gap-1 sm:gap-2 text-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-2 sm:px-3 py-1.5 rounded-full transition-all text-xs sm:text-sm tracking-wide ${
                  active === item.id
                    ? "bg-cta font-medium"
                    : "text-muted hover:text-default hover:bg-gold-soft"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/collage"
              className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm tracking-wide border border-line-strong text-default hover:bg-gold-soft transition-colors"
            >
              Memory Wall
            </Link>
            <ThemeToggle className="ml-1" />
          </nav>
        </div>
      </header>

      <main id="top">
        <ShellyHero onRsvp={() => scrollTo("rsvp")} />
        <ShellySchedule />
        <ShellyRsvpForm />
        <ShellyVideoMessage />
        <ShellyPhotoUpload />
        <ShellyFooter />
      </main>
    </div>
  );
}
