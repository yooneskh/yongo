# Yongo
This project aims to be a very simple wrapper around deno_mongo driver for MongoDB database. Yongo is inspired by Mongoose in Node.js but will not try to implement all of its functionality.

## Installation
Yongo is hosted at [https://deno.land/x/yongo](https://deno.land/x/yongo)

## Usage
Example usage is in `./examples` folder and is updated regularly to include every aspect.

Yongo works like this:

```
import { connect, Query } from 'https://deno.land/x/yongo@LATEST_VERSION/mod.ts';

await connect('mongo://host:port/dbname');


const query = new Query<interface>('collection');

query.where({ filter object });

query.projectIn('name');
query.projectOut('lastName');

query.sort({ sort object });

query.populate({ path: 'owner', collection: 'users' });

await query.query();
await query.queryOne();
await query.count();

// to create

const query = new Query<interface>('collection');

query.put('name', 'Yoones');
query.put('lastName', 'Khoshghadam');

const insertedDocument = await query.insert();

// to change

const query = new Query<interface>('collection');

query.where({ name: 'Yoones' });
query.put('age', 26);

await query.commit();
await query.commitMany();

await query.delete();
await query.deleteMany();
```

## License
Free For All!