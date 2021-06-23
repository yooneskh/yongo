import { connect, Yodel } from '../mod.ts';
import { log } from '../util/log.ts';


await connect('127.0.0.1', '27017', 'test');


interface IUserBase {
  name: string;
}

const UserModel = new Yodel<IUserBase>('User');

const madeUser = await UserModel.create({
  name: 'Yoones Khoshghadam'
});

log({ madeUser });


const foundUser = await UserModel.findById(madeUser._id);

if (!foundUser) {
  console.log('user not found.');
}
else {
  log({ foundUser });
}
