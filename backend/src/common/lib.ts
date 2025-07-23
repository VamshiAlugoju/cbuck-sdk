import { v4 as uuidv4 } from 'uuid';

export const uuid = () => {
  return uuidv4();
};

export const getDateOrNull = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;

  const cleaned = dateString.trim();
  const timestamp = Date.parse(cleaned);

  if (isNaN(timestamp)) return null;
  return new Date(timestamp);

};

