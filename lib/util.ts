import { plural } from '../deps.ts';


export function makeCollectionName(modelName: string) {
  return plural(modelName).toLowerCase();
}
