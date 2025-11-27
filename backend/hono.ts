import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { initDatabase } from "./db";

const app = new Hono();

let dbInitialized = false;
const dbInitPromise = initDatabase().then(() => {
  dbInitialized = true;
  console.log('✅ Database ready');
}).catch((error) => {
  console.error('❌ Failed to initialize database:', error);
  throw error;
});

app.use("*", async (c, next) => {
  if (!dbInitialized) {
    console.log('⏳ Waiting for database initialization...');
    await dbInitPromise;
  }
  return next();
});

app.use("*", cors({
  origin: '*',
  credentials: true,
}));

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
