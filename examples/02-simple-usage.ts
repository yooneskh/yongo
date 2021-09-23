import { Yonnection, Yuery } from '../mod.ts';
import { log } from '../util/log.ts';


await new Yonnection('mongo://127.0.0.1:27017/test').connect();
await new Yuery('users').deleteMany();


const insertQuery = new Yuery('users');
insertQuery.put('name', 'Yoones');
insertQuery.put('lastName', 'Khoshghadam');
insertQuery.put('phones', [{ phone: '123123' }]);
await insertQuery.insert();
const madeUser = await insertQuery.insert();
log({ madeUser });

const query = new Yuery('users');
query.with({ name: 'Yoones' });
const usersWithNameYoones = await query.query();
log({ usersWithNameYoones });

const updateQuery = new Yuery('users');
updateQuery.with({ name: 'Yoones' });
updateQuery.put('middleName', 'the313th');
const editResult = await updateQuery.commit();
log({ editResult });