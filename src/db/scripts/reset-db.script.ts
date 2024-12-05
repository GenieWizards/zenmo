/* eslint-disable no-console */
import { reset } from "drizzle-seed";

import env from "@/env";

import { db } from "../adapter";
import * as schema from "../schemas";

async function main() {
  if (env.NODE_ENV === "production") {
    console.log("Cannot reset the database in production environment");
    throw new Error("Cannot reset the database in production environment");
  }

  try {
    console.log("Resetting the database");
    await reset(db, schema);
    console.log("Database reset successfully....");
    process.exit(0);
  } catch (error) {
    console.log("Something went wrong in resetting the database", error);
  }
}

await main();
