import { ObjectId as _ObjectId } from 'web_bson';
export const ObjectId = _ObjectId;

export {
  Connection,
  getConnection,
  getDefaultConnection,
  connect,
} from './lib/connection.ts';

export {
  Query,
} from './lib/query.ts';

export {
  makeCollectionName,
} from './lib/util.ts';

export {
  registerPopulateItem,
  transformToQueryPopulates,
} from './lib/populate-registry.ts';
