"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/dates";

export type PainPoint = { date: string; during?: number; after?: number; next_morning?: number };

/**
 * Reines Verlaufsdiagramm der eingegebenen Werte (ADR 0004): keine Trendlinie,
 * kein Mittelwert, keine Schwellwerte. Farben aus der Palette, nicht aus der Ampel.
 */
export function PainChart({ data }: { data: PainPoint[] }) {
  if (data.length === 0) return <p className="text-sm text-muted">Noch keine Einträge.</p>;
  return (
    <div className="h-56 w-full" role="img" aria-label="Verlauf der Schmerzwerte">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-chart-grid)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={(d: string) => formatDate(d, { day: "2-digit", month: "2-digit" })} tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
          <Tooltip
            labelFormatter={(d) => formatDate(String(d))}
            formatter={(v, name) => [String(v), name === "during" ? "Während" : name === "after" ? "Danach" : "Nächster Morgen"]}
            contentStyle={{ borderRadius: 10, border: "1px solid var(--color-line)", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="during" name="during" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="after" name="after" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="next_morning" name="next_morning" stroke="var(--color-chart-3)" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <ul className="mt-1 flex gap-4 text-[11px] text-muted">
        <li><span className="mr-1 inline-block h-2 w-3 rounded-sm" style={{ background: "var(--color-chart-1)" }} />Während</li>
        <li><span className="mr-1 inline-block h-2 w-3 rounded-sm" style={{ background: "var(--color-chart-2)" }} />Danach</li>
        <li><span className="mr-1 inline-block h-2 w-3 rounded-sm" style={{ background: "var(--color-chart-3)" }} />Nächster Morgen</li>
      </ul>
    </div>
  );
}
