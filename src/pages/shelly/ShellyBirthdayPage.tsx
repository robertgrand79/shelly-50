import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "@/pages/shelly/Helmet";
import ShellyHero from "@/pages/shelly/sections/ShellyHero";
import ShellySchedule from "@/pages/shelly/sections/ShellySchedule";
import ShellyRsvpForm from "@/pages/shelly/sections/ShellyRsvpForm";
import ShellyVideoMessage from "@/pages/shelly/sections/ShellyVideoMessage";
import ShellyPhotoUpload from "@/pages/shelly/sections/ShellyPhotoUpload";
import ShellyFooter from "@/pages/shelly/sections/ShellyFooter";
import ThemeToggle from "@/components/ThemeToggle";
import { Sparkles, Menu, X, Heart } from "lucide-react";

const navItems = [
  { id: "schedule", label: "Schedule" },
  { id: "rsvp", label: "RSVP" },
  { id: "video", label: "Video Message" },
  { id: "photos", label: "Photo Memories" },
];

export default function ShellyBirthdayPage() {
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when the viewport grows past sm
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Scroll to the section in the URL hash when arriving from another route
  // (e.g. /#video or /#photos coming from the Happy Birthday Wall).
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    // Wait one frame so the section is laid out, then scroll.
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActive(id);
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [location.hash, location.key]);

  const scrollTo = (id: string) => {
    setActive(id);
    setMenuOpen(false);
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
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 font-serif text-default hover:text-default transition-colors"
          >
            <Sparkles className="w-4 h-4 text-gold-bright" />
            <span className="hidden sm:inline tracking-wide">Shelly's Golden 50th</span>
            <span className="sm:hidden tracking-wide">Shelly 50</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-1.5 rounded-full transition-all text-sm tracking-wide ${
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm tracking-wide border border-line-strong text-default hover:bg-gold-soft transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-gold-bright" />
              Happy Birthday Wall
            </Link>
            <ThemeToggle className="ml-1" />
          </nav>

          {/* Mobile controls */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-line-strong text-default hover:bg-gold-soft transition-colors"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu sheet */}
        {menuOpen && (
          <div className="sm:hidden border-t border-line bg-page-blur backdrop-blur-md">
            <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1 text-sm">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`text-left px-4 py-3 rounded-xl transition-colors tracking-wide ${
                    active === item.id
                      ? "bg-cta font-medium"
                      : "text-default hover:bg-gold-soft"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/collage"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-line-strong text-default hover:bg-gold-soft transition-colors tracking-wide"
              >
                <Heart className="w-4 h-4 text-gold-bright" />
                Happy Birthday Wall
              </Link>
            </nav>
          </div>
        )}
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
