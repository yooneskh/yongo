import { IQueryPopulate } from './query.ts';
import { makeCollectionName } from './util.ts';


export interface IPopulateRegistryItem {
  model: string;
  key: string;
  ref: string;
}


const registry: IPopulateRegistryItem[] = [];

export function registerPopulateItem(item: IPopulateRegistryItem) {
  registry.push(item);
}


export interface IModelPopulateItem {
  keyPath: string;
  fields?: string;
}

export function transformToQueryPopulates(model: string, populates: IModelPopulateItem[]): IQueryPopulate[] {
  return populates.flatMap(populate => {

    const keyParts = populate.keyPath.split('.');
    const result: IQueryPopulate[] = [];

    const chain: string[] = [];
    let usedChainIndex = 0;
    let targetModel = model;

    while (keyParts.length > 0) {

      chain.push(keyParts.shift()!);

      const registeryItem = registry.find(it =>
        it.model === targetModel && it.key === chain.slice(usedChainIndex).join('.')
      );

      if (registeryItem) {

        result.push({
          path: chain.join('.'),
          collection: makeCollectionName(registeryItem.ref),
          fields: populate.fields
        });

        targetModel = registeryItem.ref;
        usedChainIndex = chain.length;

      }

    }

    return result;

  });
}
