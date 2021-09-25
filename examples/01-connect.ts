import { connect } from '../mod.ts';

await connect('mongo://127.0.0.1:27017');

console.log('connected!');
