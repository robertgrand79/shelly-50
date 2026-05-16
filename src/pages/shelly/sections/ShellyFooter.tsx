import { Sparkles, Phone, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function ShellyFooter() {
  return (
    <footer className="py-16 px-4 sm:px-6 border-t border-line text-center">
      <Sparkles className="w-6 h-6 text-gold-bright mx-auto mb-4" />
      <p
        className="font-serif text-2xl text-default mb-2"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        Can't wait to see you in Bend
      </p>
      <p className="text-muted text-sm mb-6">June 9 – 15, 2026 · Bend & Sunriver, Oregon</p>

      <Link
        to="/collage"
        className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full border border-line-strong text-default hover:bg-gold-soft transition-colors text-sm tracking-wide"
      >
        <Heart className="w-4 h-4 text-gold-bright" />
        See the Happy Birthday Wall
      </Link>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted text-sm">
        <a
          href="tel:5419537247"
          className="inline-flex items-center gap-1.5 hover:text-default transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          Robert · 541-953-7247
        </a>
        <span className="hidden sm:inline text-faint">•</span>
        <a
          href="tel:5412210608"
          className="inline-flex items-center gap-1.5 hover:text-default transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          Shelly · 541-221-0608
        </a>
      </div>
    </footer>
  );
}
