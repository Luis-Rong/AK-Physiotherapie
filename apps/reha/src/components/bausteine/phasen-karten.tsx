/** Unterstützende Maßnahmen je Wundheilungsphase (Tagebuch S. 23). */
const PHASEN = [
  { title: "Entzündungsphase", time: "Tag 0–5", tone: "rot", items: ["Betroffenen Bereich ruhigstellen", "Nicht kühlen", "Keine entzündungshemmenden Medikamente einnehmen"] },
  { title: "Proliferationsphase", time: "Tag 5–21", tone: "gelb", items: ["Durchblutung fördern für eine bessere Nährstoffversorgung", "Koordinationstraining zur Verbesserung der Muskelansteuerung", "Allgemeines Krafttraining, um Muskelschwund vorzubeugen"] },
  { title: "Remodellierungsphase", time: "ab Tag 21", tone: "gruen", items: ["Gewebebelastbarkeit durch gezielte Reize erhöhen", "Bewegungsabläufe wiedererlernen", "Erlangen des vollen Bewegungsausmaßes"] },
] as const;

const TONES = {
  rot: "bg-ampel-rot text-white",
  gelb: "bg-ampel-gelb text-white",
  gruen: "bg-ampel-gruen text-white",
};

export function PhasenKarten() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {PHASEN.map((p) => (
        <section key={p.title} className={`rounded-[var(--radius-lg)] p-4 ${TONES[p.tone]}`}>
          <h4 className="text-base font-semibold">{p.title}</h4>
          <p className="text-xs opacity-90">{p.time}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm">
            {p.items.map((it) => <li key={it}>{it}</li>)}
          </ul>
        </section>
      ))}
      <p className="text-xs text-muted md:col-span-3">Hinweise zu Medikamenten sind allgemeine Information; die Entscheidung trifft Ihre Ärztin oder Ihr Arzt.</p>
    </div>
  );
}
