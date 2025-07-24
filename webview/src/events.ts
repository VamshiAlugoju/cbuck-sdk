// export const callSocketEvents = {
//   START_CALL: "calls:initiate",
//   INCOMING_CALL: "calls:incoming",
//   ANSWER_CALL: "calls:answer",
//   MUTE_CALL: "MUTE_CALL",
//   REJECT_CALL: "REJECT_CALL",
//   END_CALL: "calls:end",
//   LEAVE_CALL: "calls:leave",
//   RECONNECT: "calls:reconnect",
//   TERMINATE_CALL: "calls:terminate",
//   CALL_ANSWERED: "CALL_ANSWERED",
//   CALL_IGNORED: "CALL_IGNORED",
//   CALL_ENDED: "CALL_ENDED",
//   CANCEL_CALL: "CANCEL_CALL",
//   USER_LEFT_CALL: "USER_LEFT_CALL",
//   CALL_RINGING: "CALL_RINGING",
//   ADD_PEOPLE_TO_CALL: "ADD_PEOPLE_TO_CALL",
//   SWITCH_TO_VIDEO: "SWITCH_TO_VIDEO",
//   SWITCH_TO_VIDEO_ACCEPTED: "SWITCH_TO_VIDEO_ACCEPTED",
//   SWITCH_TO_VIDEO_REJECTED: "SWITCH_TO_VIDEO_REJECTED",
//   NOTIFY_OWNER: "NOTIFY_OWNER",
//   CALL_REJECTED: "calls:rejected",
//   CALL_STATUS: "calls:status",
//   INVITE_USERS: "calls:invite_users",
//   SHARE_SCREEN: "calls:share_screen",
//   REMOVE_PARTICIPANT_FROM_CALL: "REMOVE_PARTICIPANT_FROM_CALL",
//   PARTICIPANT_REMOVED_FROM_CALL: "PARTICIPANT_REMOVED_FROM_CALL",
//   YOU_ARE_REMOVED_FROM_CALL: "YOU_ARE_REMOVED_FROM_CALL",
//   STOP_SCREENSHARING: "calls:stop_screen_sharing",
//   USER_IS_ON_OTHER_CALL: "USER_IS_ON_OTHER_CALL",
//   NEW_INCOMING_CALL: "NEW_INCOMING_CALL",
//   KEEP_CALL_ALIVE: "KEEP_CALL_ALIVE",
// };

export const outGoingCallEvents = {
  START_CALL: "calls:initiate",
  END_CALL: "calls:end",
  REJECT_CALL: "calls:reject",
  IGNORE_CALL: "calls:ignore",
  RECONNECT: "calls:reconnect",
  ANSWER_CALL: "calls:answer",
  NOTIFY_OWNER: "NOTIFY_OWNER",
};

export const incomingCallEvents = {
  INCOMING_CALL: "calls:incoming",
  REJECT_CALL: "calls:reject",
  IGNORE_CALL: "calls:ignore",
  TIMEOUT_CALL: "calls:timeout",
  USER_LEFT_CALL: "calls:left",
  CALL_ENDED: "calls:ended",
  CALL_ANSWERED: "CALL_ANSWERED",

  CALL_IGNORED: "CALL_IGNORED",
  TERMINATE_CALL: "calls:terminate",
};

// export type CallSocketEventValue =
//   (typeof callSocketEvents)[keyof typeof callSocketEvents];

export const mediaSocketEvents = {
  GET_RTP_CAPABILITES: "GET_RTP_CAPABILITES",
  CREATE_PRODUCER_TRANSPORT: "CREATE_PRODUCER_TRANSPORT",
  CONNECT_PRODUCER_TRANSPORT: "CONNECT_PRODUCER_TRANSPORT",
  PRODUCE: "PRODUCE",
  CREATE_CONSUMER_TRANSPORT: "CREATE_CONSUMER_TRANSPORT",
  CONNECT_CONSUMER_TRANSPORT: "CONNECT_CONSUMER_TRANSPORT",
  CONSUME: "CONSUME",
  UNPAUSE: "UNPAUSE",
  GET_PRODUCERS: "GET_PRODUCERS",
  NEW_PRODUCER: "NEW_PRODUCER",
  CONSUME_DATA_PRODCUCER: "CONSUME_DATA_PRODCUCER",
};

export const translationEvents = {
  INITIATE_TRANSLATION: "INITIATE_TRANSLATION",
};
