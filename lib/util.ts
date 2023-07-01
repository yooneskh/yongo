import { plural } from 'deno_plural';


export function makeCollectionName(modelName: string) {
  return plural(modelName).toLowerCase();
}


// deno-lint-ignore no-explicit-any
export function traverseObject(object: any, transformer: (key: string, value: any) => any) {
  if (typeof object !== 'object' || object === null) return;

  if (Array.isArray(object)) {
    for (const element of object) {
      traverseObject(element, transformer);
    }
  }
  else {
    for (const key in object) {
      object[key] = transformer(key, object[key]);
      traverseObject(object[key], transformer);
    }
  }


}