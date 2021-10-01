import { registerPopulateItem, transformToQueryPopulates } from '../mod.ts';

registerPopulateItem({
  model: 'User',
  key: 'owner',
  ref: 'User'
});

registerPopulateItem({
  model: 'User',
  key: 'address',
  ref: 'Address'
});

registerPopulateItem({
  model: 'Address',
  key: 'owner',
  ref: 'User'
});

registerPopulateItem({
  model: 'Address',
  key: 'parent',
  ref: 'Address'
});

registerPopulateItem({
  model: 'User',
  key: 'profile',
  ref: 'Media'
});

registerPopulateItem({
  model: 'Media',
  key: 'owner',
  ref: 'User'
});

console.log(transformToQueryPopulates(
  'User',
  [
    { keyPath: 'owner' },
    { keyPath: 'owner.profile' },
    { keyPath: 'owner.address' },
    { keyPath: 'owner.address.owner' },
    { keyPath: 'owner.address.owner.profile' },
    { keyPath: 'address' },
    { keyPath: 'address.parent' },
    { keyPath: 'profile' },
    { keyPath: 'profile.owner' }
  ]
));

console.log(transformToQueryPopulates(
  'Address',
  [
    { keyPath: 'parent' },
    { keyPath: 'parent.owner' },
    { keyPath: 'parent.owner.profile' },
    { keyPath: 'parent.owner.address' },
    { keyPath: 'parent.owner.address.parent' },
  ]
));
