import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import helmet from "helmet";
import passport from "passport";
import compression from "compression";

import "./config/passport.js";
import error from "./middlewares/error.js";
import router from "./routes/index.js";
import webhook from "./routes/webhook.js";
import startServer from "./startup/start-server.js";

dotenv.config();

const app = express();

// Webhook routes first (usually need raw body)
app.use("/api/webhook", express.raw({ type: "application/json" }), webhook);

// Optimized CORS configuration
const whitelist = [
  "https://findtalentz.com",
  "http://localhost:3000",
  "https://talentz-admin.netlify.app",
];

const whitelistSet = new Set(whitelist);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelistSet.has(origin)) {
      callback(null, true);
    } else {
      // Optional: log blocked origins for debugging
      console.log(`CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors(corsOptions));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);
app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(passport.initialize());

// Routes
app.use("/api", router);

// Error handling
app.use(error);

startServer(app);
