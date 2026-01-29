import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { Match } from "./mongodb";

export async function registerRoutes(app: express.Router): Promise<void> {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production"
    });
  });

  app.get("/matches", async (req, res) => {
    try {
      const authenticatedUser = req.isAuthenticated() ? (req.user as any) : null;
      const userId = req.query.userId as string || authenticatedUser?._id;
      
      if (!userId) {
        console.warn("Unauthorized access attempt to /matches - no userId provided and not authenticated");
        return res.status(401).json({ message: "Unauthorized - userId required" });
      }
      
      const matches = await Match.find({ userId }).sort({ createdAt: -1 });
      res.json(matches);
    } catch (err) {
      console.error("Error fetching matches:", err);
      res.status(500).json({ message: "Error fetching matches" });
    }
  });

  app.post("/matches", async (req, res) => {
    try {
      const authenticatedUser = req.isAuthenticated() ? (req.user as any) : null;
      const userId = req.body.userId || authenticatedUser?._id;
      
      if (!userId) {
        console.warn("Unauthorized access attempt to /matches (POST) - no userId provided");
        return res.status(401).json({ message: "Unauthorized - userId required" });
      }
      
      const match = new Match({
        userId,
        details: req.body.details,
        summary: req.body.summary,
        status: req.body.status || 'active',
        totalFish: req.body.details?.totalFish || 0
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
    try {
      const authenticatedUser = req.isAuthenticated() ? (req.user as any) : null;
      const userId = req.body.userId || authenticatedUser?._id;
      
      if (!userId) {
        console.warn("Unauthorized access attempt to /matches (PATCH) - no userId provided");
        return res.status(401).json({ message: "Unauthorized - userId required" });
      }
      
      const match = await Match.findOneAndUpdate(
        { _id: req.params.id, userId },
        { 
          details: req.body.details,
          summary: req.body.summary,
          status: req.body.status,
          totalFish: req.body.details?.totalFish // Sync totalFish to top level if needed
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
