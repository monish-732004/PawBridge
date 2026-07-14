import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes.js";
import { ensureAdminBootstrap } from "./auth.js";

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use("/api", routes);

const PORT = process.env.PORT || 3001;

ensureAdminBootstrap().then(() => {
  app.listen(PORT, () => console.log(`[PawBridge] API listening on http://localhost:${PORT}`));
});
