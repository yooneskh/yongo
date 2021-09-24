export {
  MongoClient,
  Database,
  Collection
} from "https://deno.land/x/mongo@v0.27.0/mod.ts";

import { Bson } from 'https://deno.land/x/mongo@v0.27.0/mod.ts';
export const ObjectId = Bson.ObjectId;

export {
  plural,
  singular
} from 'https://deno.land/x/deno_plural@1.0.1/mod.ts';

export {
  deepmerge as deepMerge
} from 'https://deno.land/x/deepmerge@1.0.3/mod.ts';
