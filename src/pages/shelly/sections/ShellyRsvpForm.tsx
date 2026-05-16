import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SCHEDULE } from "@/pages/shelly/schedule";
import { SectionHeader } from "@/pages/shelly/sections/ShellySchedule";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  party_size: number;
  not_attending: boolean;
  attendance: Record<string, boolean>;
  dietary_notes: string;
  message: string;
}

const initialForm: FormState = {
  full_name: "",
  email: "",
  phone: "",
  party_size: 1,
  not_attending: false,
  attendance: {},
  dietary_notes: "",
  message: "",
};

export default function ShellyRsvpForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleEvent = (id: string, checked: boolean) =>
    setForm((f) => ({ ...f, attendance: { ...f.attendance, [id]: checked } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setSubmitting(true);
    // Trim out false values to keep payload compact
    const attendance = Object.fromEntries(
      Object.entries(form.attendance).filter(([, v]) => v),
    );
    const { error } = await supabase.from("shelly_rsvps").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      party_size: form.party_size,
      not_attending: form.not_attending,
      attendance,
      dietary_notes: form.dietary_notes.trim() || null,
      message: form.message.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      console.error(error);
      toast.error("Couldn't send your RSVP. Please try again or text Robert directly.");
      return;
    }
    setSubmitted(true);
    toast.success("RSVP received — see you in Bend!");
  };

  if (submitted) {
    return (
      <section id="rsvp" className="py-20 px-4 sm:px-6 border-t border-amber-500/10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/40 mb-6">
            <CheckCircle2 className="w-8 h-8 text-amber-300" />
          </div>
          <h2
            className="font-serif text-3xl sm:text-4xl text-amber-50 mb-4"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            RSVP Received!
          </h2>
          <p className="text-amber-100/80 mb-6">
            Thank you for celebrating Shelly with us. Scroll down to record a birthday video message or share a
            favorite photo of Shelly through the years.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setForm(initialForm);
              setSubmitted(false);
            }}
            className="border-amber-500/40 text-amber-200 bg-transparent hover:bg-amber-500/10 hover:text-amber-100"
          >
            Submit another RSVP
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-amber-500/10">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          eyebrow="RSVP"
          title="Pick Your Adventure"
          subtitle="Check off every event you plan to attend. Coming for the whole week? Coming for just one dinner? Both are perfect."
        />

        <form onSubmit={handleSubmit} className="mt-12 space-y-10">
          {/* Guest info */}
          <div className="rounded-2xl border border-amber-500/20 bg-white/[0.02] p-6 sm:p-8 space-y-5">
            <h3
              className="font-serif text-2xl text-amber-100"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              About you
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name(s)" required>
                <Input
                  required
                  value={form.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  placeholder="e.g. Sam & Jordan Rivera"
                  className="bg-[#0d0a08] border-amber-500/30 text-amber-50 placeholder:text-amber-200/30 focus-visible:ring-amber-400"
                />
              </Field>
              <Field label="Total in your party">
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={form.party_size}
                  onChange={(e) => setField("party_size", Math.max(0, Number(e.target.value) || 0))}
                  className="bg-[#0d0a08] border-amber-500/30 text-amber-50 focus-visible:ring-amber-400"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="you@example.com"
                  className="bg-[#0d0a08] border-amber-500/30 text-amber-50 placeholder:text-amber-200/30 focus-visible:ring-amber-400"
                />
              </Field>
              <Field label="Phone">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="(555) 555-5555"
                  className="bg-[#0d0a08] border-amber-500/30 text-amber-50 placeholder:text-amber-200/30 focus-visible:ring-amber-400"
                />
              </Field>
            </div>
          </div>

          {/* Can't attend toggle */}
          <label className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-white/[0.02] p-5 cursor-pointer hover:bg-amber-500/[0.04] transition-colors">
            <Checkbox
              checked={form.not_attending}
              onCheckedChange={(c) => setField("not_attending", !!c)}
              className="mt-0.5 border-amber-400/60 data-[state=checked]:bg-amber-400 data-[state=checked]:text-[#0d0a08]"
            />
            <div className="text-sm text-amber-100/90">
              <span className="font-medium text-amber-100">Sadly, I can't make it.</span>{" "}
              <span className="text-amber-200/70">
                We'll miss you! Please consider recording a video message below for Shelly to watch at her Brunch
                Bash.
              </span>
            </div>
          </label>

          {/* Day-by-day event grid (skips informational rows and empty days) */}
          {!form.not_attending && (
            <div className="space-y-8">
              {SCHEDULE.map((part) => {
                const daysWithCheckable = part.days
                  .map((day) => ({
                    ...day,
                    events: day.events.filter((e) => !e.informational),
                  }))
                  .filter((day) => day.events.length > 0);
                if (daysWithCheckable.length === 0) return null;
                return (
                  <div key={part.part}>
                    <h3
                      className="font-serif text-xl text-amber-200 mb-1"
                      style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                    >
                      {part.subtitle}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {daysWithCheckable.map((day) => (
                        <div
                          key={day.key}
                          className={`rounded-xl border p-4 ${
                            day.highlight
                              ? "border-amber-400/50 bg-amber-500/[0.06]"
                              : "border-amber-500/20 bg-white/[0.02]"
                          }`}
                        >
                          <div className="text-amber-100 font-medium mb-3 text-sm">{day.date}</div>
                          <div className="space-y-2.5">
                            {day.events.map((ev) => (
                              <label
                                key={ev.id}
                                className="flex items-start gap-2.5 cursor-pointer group"
                              >
                                <Checkbox
                                  checked={!!form.attendance[ev.id]}
                                  onCheckedChange={(c) => toggleEvent(ev.id, !!c)}
                                  className="mt-0.5 border-amber-400/50 data-[state=checked]:bg-amber-400 data-[state=checked]:text-[#0d0a08]"
                                />
                                <div className="text-xs sm:text-sm leading-snug">
                                  <span className="text-amber-300/80 font-mono">{ev.time}</span>{" "}
                                  <span className="text-amber-50 group-hover:text-amber-100">
                                    {ev.title}
                                  </span>
                                  {ev.link && (
                                    <a
                                      href={ev.link.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 hover:text-amber-100 text-[10px] tracking-wide align-middle"
                                    >
                                      {ev.link.label}
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  {ev.note && (
                                    <div className="text-amber-200/50 italic text-[11px] mt-0.5">
                                      {ev.note}
                                    </div>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Notes */}
          <div className="rounded-2xl border border-amber-500/20 bg-white/[0.02] p-6 sm:p-8 space-y-5">
            <Field label="Dietary restrictions, allergies, or anything we should know?">
              <Textarea
                value={form.dietary_notes}
                onChange={(e) => setField("dietary_notes", e.target.value)}
                rows={3}
                placeholder="Vegetarian, gluten-free, nut allergy, etc."
                className="bg-[#0d0a08] border-amber-500/30 text-amber-50 placeholder:text-amber-200/30 focus-visible:ring-amber-400"
              />
            </Field>
            <Field label="A note for Shelly (optional)">
              <Textarea
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                rows={3}
                placeholder="Share a memory, a wish, or just say hi 🎉"
                className="bg-[#0d0a08] border-amber-500/30 text-amber-50 placeholder:text-amber-200/30 focus-visible:ring-amber-400"
              />
            </Field>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="bg-gradient-to-br from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-[#0d0a08] font-medium px-10 py-6 text-base rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-400/50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send My RSVP"
              )}
            </Button>
            <p className="text-xs text-amber-200/50">
              Or text Robert at <a href="tel:5419537247" className="text-amber-300 hover:underline">541-953-7247</a>{" "}
              or Shelly at <a href="tel:5412210608" className="text-amber-300 hover:underline">541-221-0608</a>.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-amber-200/80 text-xs tracking-wide uppercase">
        {label}
        {required && <span className="text-amber-400 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}
