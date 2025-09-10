import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "https://geofence-git-mlwork-divyansh-tulsianis-projects.vercel.app",
    "http://localhost:5173", // for local development
    "http://localhost:3000"  // for local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/health',(req,res)=>{
  res.send("healthy")
})

app.post("/send-notification", async (req, res) => {
  const { userId, title, message } = req.body;

  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        filters: [
          { field: "tag", key: "userId", relation: "=", value: userId },
        ],
        headings: { en: title },
        contents: { en: message },
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
