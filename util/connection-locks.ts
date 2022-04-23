import { Lock, IniterMap } from '../deps.ts';


export const connectionLocks = new IniterMap<string, Lock>(() => {

  const lock = new Lock();
  lock.lock();

  return lock;

});
