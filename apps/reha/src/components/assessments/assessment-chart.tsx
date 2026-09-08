"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/dates";

export type AssessmentPoint = { name: string; side: string | null; assessedOn: string; score: string };

type Series = { key: string; label: string; unit: string; points: { date: string; value: number }[] };

/** Zahl aus „95°", „12,5 kg", „3/10" – der Rest ist die Einheit. Nicht zahlbare Werte bleiben in der Tabelle. */
function parseScore(score: string): { value: number; unit: string } | null {
  const m = score.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!m) return null;
  return { value: Number(m[1]!.replace(",", ".")), unit: m[2] ?? "" };
}

export function buildSeries(rows: AssessmentPoint[]): Series[] {
  const map = new Map<string, Series>();
  for (const r of rows) {
    const p = parseScore(r.score);
    if (!p) continue;
    const key = `${r.name}|${r.side ?? ""}`;
    const s = map.get(key) ?? { key, label: r.side ? `${r.name} · ${r.side}` : r.name, unit: p.unit, points: [] };
    s.points.push({ date: r.assessedOn, value: p.value });
    map.set(key, s);
  }
  return [...map.values()]
    .map((s) => ({ ...s, points: s.points.sort((a, b) => a.date.localeCompare(b.date)) }))
    .filter((s) => s.points.length >= 2)
    .sort((a, b) => a.label.localeCompare(b.label));
}

const COLORS = ["var(--color-chart-3)", "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-moss)", "var(--color-sun)"];

/**
 * Verlauf der Messwerte je Assessment – reine Anzeige der eingetragenen Werte
 * (ADR 0004): keine Ziel-Linie, kein Trend, keine Bewertung.
 */
export function AssessmentChart({ rows }: { rows: AssessmentPoint[] }) {
  const series = buildSeries(rows);
  if (series.length === 0) return null;
  return (
    <div className="space-y-4">
      {series.map((s, i) => (
        <div key={s.key}>
          <p className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-semibold text-ink">{s.label}</span>
            <span className="text-xs text-muted">
              {s.points.length} Messungen{s.unit ? ` · ${s.unit}` : ""}
            </span>
          </p>
          <div className="h-36 w-full" role="img" aria-label={`Verlauf ${s.label}`}>
            <ResponsiveContainer>
              <LineChart data={s.points} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-chart-grid)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d: string) => formatDate(d, { day: "2-digit", month: "2-digit" })} tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip
                  labelFormatter={(d) => formatDate(String(d))}
                  formatter={(v) => [`${v}${s.unit ? ` ${s.unit}` : ""}`, s.label]}
                  contentStyle={{ borderRadius: 10, border: "1px solid var(--color-line)", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="value" stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 0, fill: COLORS[i % COLORS.length] }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
