// deno-lint-ignore-file no-explicit-any

import { Yonnection, Yuery } from '../mod.ts';
import { log } from '../util/log.ts';


await new Yonnection('mongo://127.0.0.1:27017/test').connect();
await new Yuery('users').deleteMany();
await new Yuery('homes').deleteMany();


const insertQuery = new Yuery('users');
insertQuery.put('name', 'Yoones');
insertQuery.put('lastName', 'Khoshghadam');
insertQuery.put('phones', [{ phone: '123123', addresses: [{ name: 'home' }] }]);
await insertQuery.insert();
const madeUser = await insertQuery.insert();
log({ madeUser });

const query = new Yuery('users');
query.where({ name: 'Yoones' });
const userswhereNameYoones = await query.query();
log({ userswhereNameYoones });

const updateQuery = new Yuery('users');
updateQuery.where({ name: 'Yoones' });
updateQuery.put('middleName', 'the313th');
const editResult = await updateQuery.commit();
log({ editResult });


const newHomeQuery = new Yuery('homes');
newHomeQuery.put('name', 'New Home');
newHomeQuery.put('owner', String((madeUser as any)._id));
const madeHome = await newHomeQuery.insert();
log({ madeHome });


const getHomeQuery = new Yuery('homes');
getHomeQuery.populate({ path: 'owner', collection: 'users' });
const homes = await getHomeQuery.query();
log({ homes });
