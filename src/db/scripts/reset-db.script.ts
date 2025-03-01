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
    console.log(`Resetting the database in ${env.NODE_ENV} environment`);
    await reset(db, schema);
    console.log(`Database reset successfully in ${env.NODE_ENV} environment`);
    process.exit(0);
  } catch (error) {
    console.log("Error resetting the database: ", error);
    process.exit(1);
  }
}

await main();
