# Yodel
This project aims to be a very simple wrapper around deno_mongo driver for MongoDB database. Yongo is inspired by Mongoose in Node.js but will not try to implement all of its functionality.

## Installation
Yongo is hosted at [https://deno.land/x/yongo](https://deno.land/x/yongo)

## Usage
Example usage is in `./examples` folder and is updated regularly to include every aspect.

Yongo works like this:

```
import { connect, Yodel } from 'https://deno.land/x/yongo@LATEST_VERSION/mod.ts';

await connect('HOST', 'PORT', 'DB_NAME');

interface IUser {
  name: string;
}

const UserModel = new Yodel<IUser>('User');

const creatdUser = await UserModel.create({
  name: 'Yoones Khoshghadam'
});

console.log(createdUser._id, createdUser.name); // type is inferred correctly
```

## License
Free For All!