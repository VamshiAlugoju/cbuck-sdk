import { nanoid } from 'nanoid';

export const generateLocalMessageId = () => {
  return nanoid(21);
};
