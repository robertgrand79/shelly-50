import { SCHEDULE } from "@/pages/shelly/schedule";
import { Sparkles, MapPin, ExternalLink } from "lucide-react";

export default function ShellySchedule() {
  return (
    <section id="schedule" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-line">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          eyebrow="The Adventure"
          title="A Week in the Mountains"
          subtitle="Come for one meal, one hike, or the full seven days. Every event is optional — just let us know which you'll join."
        />

        <div className="mt-14 space-y-16">
          {SCHEDULE.map((part) => (
            <div key={part.part}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                <span className="text-gold-bright text-xs tracking-[0.25em] uppercase">{part.part}</span>
                <h3 className="font-serif text-2xl sm:text-3xl text-strong" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                  {part.subtitle}
                </h3>
              </div>
              <p className="text-muted text-sm flex items-start gap-1.5 mb-8">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {part.location}
              </p>

              <div className="space-y-4">
                {part.days.map((day) => (
                  <div
                    key={day.key}
                    className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                      day.highlight
                        ? "border-line-strong bg-gold-soft shadow-cta"
                        : "border-line bg-surface-1"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      {day.highlight && <Sparkles className="w-4 h-4 text-gold-bright" />}
                      <h4
                        className={`font-serif text-xl sm:text-2xl ${
                          day.highlight ? "text-default" : "text-default"
                        }`}
                        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                      >
                        {day.date}
                      </h4>
                    </div>
                    <ul className="space-y-3">
                      {day.events.map((ev) => (
                        <li key={ev.id} className="flex gap-4 text-sm sm:text-base">
                          <span className="font-mono text-gold-bright text-xs sm:text-sm shrink-0 w-20 sm:w-24 pt-0.5">
                            {ev.time}
                          </span>
                          <div className="flex-1">
                            <span className="text-strong">{ev.title}</span>
                            {ev.link && (
                              <a
                                href={ev.link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-line-strong bg-gold-soft text-default hover:bg-gold-medium hover:text-default text-xs tracking-wide align-middle"
                              >
                                {ev.link.label}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {ev.note && (
                              <p className="text-muted text-xs sm:text-sm mt-1 italic">{ev.note}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-5 rounded-xl border border-line bg-surface-2 text-sm text-muted">
          <strong className="text-gold">A note on reservations:</strong> All dining spots and the Lava Cave
          require strict headcounts. Please RSVP early so we can lock in the numbers!
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-gold-bright text-xs tracking-[0.3em] uppercase mb-3">{eyebrow}</div>
      <h2
        className="font-serif text-3xl sm:text-5xl text-strong"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-default/70 text-sm sm:text-base max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
