// deno-lint-ignore-file no-explicit-any

import { connect, Query } from '../mod.ts';
import { log } from '../util/log.ts';


await connect('mongo://127.0.0.1:27017/test');
await new Query<any>('users').deleteMany();
await new Query<any>('homes').deleteMany();


const insertQuery = new Query<any>('users');
insertQuery.put('name', 'Yoones');
insertQuery.put('lastName', 'Khoshghadam');
insertQuery.put('phones', [{ phone: '123123', addresses: [{ name: 'home' }] }]);
const user1 = await insertQuery.insert();
insertQuery.put('parent', user1._id);
const madeUser = await insertQuery.insert();
log({ madeUser });

const query = new Query<any>('users');
query.where({ name: 'Yoones' });
const userswhereNameYoones = await query.query();
log({ userswhereNameYoones });

const updateQuery = new Query<any>('users');
updateQuery.where({ name: 'Yoones' });
updateQuery.put('middleName', 'the313th');
const editResult = await updateQuery.commit();
log({ editResult });


const newHomeQuery = new Query<any>('homes');
newHomeQuery.put('name', 'New Home');
newHomeQuery.put('owner', madeUser._id);
newHomeQuery.put('attendees', [ madeUser._id, String(user1._id) ]);
const madeHome = await newHomeQuery.insert();
log({ madeHome });


const getHomeQuery = new Query<any>('homes');
getHomeQuery.populate({ path: 'owner', collection: 'users' });
getHomeQuery.populate({ path: 'owner.parent', collection: 'users' });
getHomeQuery.populate({ path: 'attendees', collection: 'users' });
getHomeQuery.populate({ path: 'attendees.parent', collection: 'users' });
const homes = await getHomeQuery.query();
log({ homes });
