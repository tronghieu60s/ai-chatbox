import { atom, selector } from 'recoil';

export const userState = selector({
  key: 'user',
  get: () => null
});

export const displayNameState = atom({ key: 'displayName', default: '' });
