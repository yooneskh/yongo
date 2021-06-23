// deno-lint-ignore no-explicit-any
export function log(thing: any) {
  console.log(JSON.stringify(thing, undefined, '  '));
}