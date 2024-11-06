import * as HTTPStatusPhrases from "@/common/utils/http-status-phrases.util";

import { createMessageObjectSchema } from "../schema/create-message-object.schema";

export const notFoundSchema = createMessageObjectSchema(HTTPStatusPhrases.NOT_FOUND);
