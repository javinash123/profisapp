import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  durationMinutes: integer("duration_minutes").notNull(),
  pegNumber: text("peg_number").notNull(),
  numberOfNets: integer("number_of_nets").notNull(),
  netCapacity: integer("net_capacity"), // in grams
  unit: text("unit").notNull(), // 'lb/oz' or 'kg/g'
  keepScreenOn: boolean("keep_screen_on").default(true),
  totalWeight: integer("total_weight").default(0),
  totalFish: integer("total_fish").default(0),
});

export const nets = pgTable("nets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").references(() => matches.id),
  index: integer("index").notNull(),
  weight: integer("weight").default(0),
  capacity: integer("capacity"),
});

export const alarms = pgTable("alarms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  label: text("label"),
  mode: text("mode").notNull(), // 'one-time', 'repeat'
  time: timestamp("time"),
  intervalMinutes: integer("interval_minutes"),
  soundEnabled: boolean("sound_enabled").default(true),
  vibrationEnabled: boolean("vibration_enabled").default(true),
  tone: text("tone").default("default"),
  enabled: boolean("enabled").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Net = typeof nets.$inferSelect;
export type Alarm = typeof alarms.$inferSelect;
