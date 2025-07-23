// room-events.ts
import { EventEmitter } from 'events';

export const roomEventEmitter = new EventEmitter();

export const ROOM_EVENTS = {
  CLEANUP: 'room:cleanup',
};
