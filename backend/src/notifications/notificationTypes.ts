export const notifEvents = {
  calls: {
    incoming: 'calls:incoming',
    missed: 'calls:missed',
    rejected: 'calls:rejected',
    accepted: 'calls:accepted',
    ended: 'calls:ended',
  },
  messages: {
    send: 'messages:send',
    incoming: 'messages:incoming',

    received: 'messages:received',
    seen: 'messages:seen',
    delete: 'messages:delete',

    pin: 'messages:pin',
    unpin: 'messages:unpin',
    mentioned: 'message:mentioned',
    queued: 'messages:queued',
    sentScheduled: 'messages:sentScheduled',
    reaction: {
      add: 'messages:reaction:add',
      update: 'messages:reaction:update',
      remove: 'messages:reaction:remove',
      //to inform other members
      added: 'messages:reaction:added',
      updated: 'messages:reaction:updated',
      removed: 'messages:reaction:removed',
    },
    status: {
      delivered: 'messages:status:delivered',
      seen: 'messages:status:seen',
      deleted: 'messages:status:deleted',
      pinned: 'messages:status:pinned',
      unpinned: 'messages:status:unpinned',
    },
    updateScheduled: 'messages:updateScheduled',
  },
  chatSpaces: {
    leave: 'chatSpaces:leave',
    join: 'chatSpaces:join',
    joinViaLink: 'chatSpaces:joinViaLink',
    deleted: 'chatSpace:deleted',
    infoUpdated: 'chatSpace:infoUpdated',
    memberPrivilegesUpdated: 'chatSpace:memberPrivilegesUpdated',
    adminPrivilegesUpdated: 'chatSpace:adminPrivilegesUpdated',
    memberAdded: 'chatSpace:memberAdded', // while created group and added some members
    memberRemoved: 'chatSpace:memberRemoved',

    getOnlineMembers: 'chatSpace:getOnlineMembers',
    getOnlineMembersResponse: 'chatSpace:getOnlineMembersResponse',
    joinRequestReceived: 'chatSpace:joinRequestReceived',
    joinRequestApproved: 'chatSpace:joinRequestApproved',
    joinRequestRejected: 'chatSpace:joinRequestRejected',
  },
  members: {
    roleUpdated: 'members:roleUpdated',
  },
  users: {
    getOnlineUsers: 'user:getOnlineUsers',
  },
} as const;

export type LeafValues<T> = T extends object
  ? { [K in keyof T]: LeafValues<T[K]> }[keyof T]
  : T;

export type NotificationType = LeafValues<typeof notifEvents>;

export const chatSpacesEvents = {
  start_stream: 'channel:start_stream',
  end_stream: 'channel:end_stream',
};
