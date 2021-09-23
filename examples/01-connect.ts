import { Yonnection } from '../mod.ts';
import { log } from '../util/log.ts';


await new Yonnection('mongo://127.0.0.1:27017').connect();

log('connected!');
