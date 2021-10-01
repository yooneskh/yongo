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
  return populates.map(populate => {

    let targetModel = model;

    for (const keyPart of populate.keyPath.split('.')) {
      targetModel = registry.find(it => it.model === targetModel && it.key === keyPart)?.ref ?? '';
    }

    if (!targetModel) {
      throw new Error(`could not populate ${populate.keyPath} of ${model}`);
    }

    return {
      path: populate.keyPath,
      collection: makeCollectionName(targetModel),
      fields: populate.fields
    };

  });
}
