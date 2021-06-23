import { connect, Yodel } from '../mod.ts';
import { log } from '../util/log.ts';

await connect('127.0.0.1', '27017', 'test');


interface IUserBase {
  name: string;
}


// create

const UserModel = new Yodel<IUserBase>('User');

const madeUsers = await Promise.all([
  UserModel.create({ name: 'Yoones Khoshghadam' }),
  UserModel.create({ name: 'Yoones Khoshghadam' }),
  UserModel.create({ name: 'Yoones Khoshghadam' }),
  UserModel.create({ name: 'Yoones Khoshghadam' })
])

log({ madeUsers });


// retrieve single

const foundUser = await UserModel.findById(madeUsers[0]._id);

if (!foundUser) {
  log('user not found.');
}
else {
  log({ foundUser });
}


// retrieve all

const users = await UserModel.find();
log({ users });


// single find

const oneUser = await UserModel.findOne({ name: 'Yoones Khoshghadam' });
log({ oneUser });


// count

const counts = await UserModel.count({ name: 'Yoones Khoshghadam' });
log({ counts });


// edit

const editedUser = await UserModel.updateById(madeUsers[0]._id, { name: 'Yoones Khoshghadam Edited' });
log({ editedUser });


// edit filtered

const editedUser2 = await UserModel.updateOne(
  {
    name: 'Yoones Khoshghadam'
  },
  {
    name: 'Yoones Khoshghadam Edited 2'
  }
);

log({ editedUser2 });


// edit filtered

const editedUser3 = await UserModel.updateMany(
  {
    name: 'Yoones Khoshghadam'
  },
  {
    name: 'Yoones Khoshghadam Edited 3'
  }
);

log({ editedUser3 });


// delete id

log({
  deleteId: await UserModel.deleteById(madeUsers[0]._id)
});


// delete one

log({
  deleteOne: await UserModel.deleteOne({ name: 'Yoones Khoshghadam Edited 2'})
});


// delete many

log({
  deleteOne: await UserModel.deleteMany({ name: 'Yoones Khoshghadam Edited 3'})
});
