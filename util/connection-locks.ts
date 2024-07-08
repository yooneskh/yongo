import { Lock } from 'https://deno.land/x/unified_deno_lock@v0.1.1/mod.ts';
import { IniterMap } from 'https://deno.land/x/initer_map@v1.0.0/mod.ts';


export const connectionLocks = new IniterMap<string, Lock>(() => {

  const lock = new Lock();
  lock.lock();

  return lock;

});
