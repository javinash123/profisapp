import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { Match } from "./mongodb";

export async function registerRoutes(app: Express): Promise<void> {
  // Use .all to ensure we catch all methods for logging/auth before specific routes if needed
  // but here we just register the specific endpoints
  
  app.get("/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const matches = await Match.find({ userId: (req.user as any)._id }).sort({ createdAt: -1 });
      res.json(matches);
    } catch (err) {
      res.status(500).json({ message: "Error fetching matches" });
    }
  });

  app.post("/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const match = new Match({
        userId: (req.user as any)._id,
        details: req.body.details,
        summary: req.body.summary,
        status: req.body.status || 'active'
      });
      await match.save();
      console.log("Match saved successfully to MongoDB:", match._id);
      res.status(201).json(match);
    } catch (err) {
      console.error("Error saving match to MongoDB:", err);
      res.status(500).json({ message: "Error saving match" });
    }
  });

  app.patch("/matches/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
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
      if (!match) return res.status(404).json({ message: "Match not found" });
      res.json(match);
    } catch (err) {
      console.error("Error updating match in MongoDB:", err);
      res.status(500).json({ message: "Error updating match" });
    }
  });
}
