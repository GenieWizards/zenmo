import { $ } from "bun";
import { afterAll, beforeAll } from "bun:test";

beforeAll(async () => {
  await $`bun drizzle-kit push --force`;
});

afterAll(async () => {
  await $`bun run db:clear`;
});
