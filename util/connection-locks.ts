import { Lock } from 'unified_deno_lock';
import { IniterMap } from 'initer_map';


export const connectionLocks = new IniterMap<string, Lock>(() => {

  const lock = new Lock();
  lock.lock();

  return lock;

});
