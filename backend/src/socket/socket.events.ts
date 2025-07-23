export const SocketEvents = {
  USER_ONLINE: 'user:online', // to emit event in ONLINE_USERS room , when a user comes online first time
  USER_OFFLINE: 'user:offline', // to emit event in ONLINE_USERS room, when a user goes offline (no device connected)
  ONLINE_USERS: 'online-users', // common socket room where all online users sockets will be joined
  CHECK_USERS_ONLINE: 'check:users:online',
} as const;

export type SocketEventType = (typeof SocketEvents)[keyof typeof SocketEvents];
