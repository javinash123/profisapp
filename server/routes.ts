import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { Match } from "./mongodb";

export async function registerRoutes(app: Express): Promise<void> {
  app.get("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const matches = await Match.find({ userId: (req.user as any)._id }).sort({ createdAt: -1 });
      res.json(matches);
    } catch (err) {
      res.status(500).send("Error fetching matches");
    }
  });

  app.post("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const match = new Match({
        userId: (req.user as any)._id,
        details: req.body.details,
        summary: req.body.summary,
        status: req.body.status || 'active'
      });
      await match.save();
      res.status(201).json(match);
    } catch (err) {
      console.error("Error saving match:", err);
      res.status(500).send("Error saving match");
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const match = await Match.findOneAndUpdate(
        { _id: req.params.id, userId: (req.user as any)._id },
        { 
          details: req.body.details,
          summary: req.body.summary,
          status: req.body.status
        },
        { new: true }
      );
      if (!match) return res.status(404).send("Match not found");
      res.json(match);
    } catch (err) {
      console.error("Error updating match:", err);
      res.status(500).send("Error updating match");
    }
  });
}
