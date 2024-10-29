import { app } from "./app";
import env from "./env";

const port = env.PORT || 8998;

export default {
  port,
  fetch: app.fetch,
};
