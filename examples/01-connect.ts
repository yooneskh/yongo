import { connect, getClient } from '../mod.ts';
import { log } from '../util/log.ts';


await connect('127.0.0.1', '27017', 'test');
log(getClient());
