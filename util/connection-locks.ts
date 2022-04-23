import { Lock } from '../deps.ts';
import { IniterMap } from '../deps.ts';


export const connectionLocks = new IniterMap<string, Lock>(() => new Lock());
