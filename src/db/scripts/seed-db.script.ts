/* eslint-disable no-console */
import { reset, seed } from "drizzle-seed";

import { db } from "../adapter";
import * as schema from "../schemas";

async function main() {
  try {
    console.log("Resetting the database");
    await reset(db, schema);
    console.log("Seed script execution started....");
    await seed(db, schema).refine(fn => ({
      expenseModel: {
        columns: {
          currency: fn.default({
            defaultValue: "INR",
          }),
        },
      },
    }));
    console.log("Seed script executed successfully");
    process.exit(0);
  } catch (error) {
    console.log("Something went wrong in seed script execution", error);
  }
}

await main();
