import { z } from "zod";

/** Gemeinsames Schema für Wochen in Vorlagen und beim Anwenden (Server-Seite). */
export const templateExerciseSchema = z.object({
  section: z.enum(["warmup", "main", "cooldown"]),
  exerciseId: z.string().uuid().nullable(),
  name: z.string().trim().min(1).max(120),
  sets: z.string().trim().max(40),
  reps: z.string().trim().max(40),
  weight: z.string().trim().max(40),
  duration: z.string().trim().max(40),
  remarks: z.string().trim().max(500),
});

export const templateWeekSchema = z.object({
  weekNumber: z.number().int().min(1).max(200),
  goal: z.string().trim().max(200),
  notes: z.string().trim().max(4000),
  trainingDays: z.array(z.number().int().min(1).max(7)),
  exercises: z.array(templateExerciseSchema).max(60),
});

export const templateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000),
  weeks: z.array(templateWeekSchema).min(1).max(52),
});
