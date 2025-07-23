// import { UserDocument } from 'src/user.module/schemas/user.schema';
// import { CallDocument } from '../schemas/call.schema';

export enum CallType {
  audio = 'audio',
  video = 'video',
}

// export type EmailDataType = {
//   callrecord: CallDocument | null;
//   userDetails: UserDocument[] | null;
//   callLink: string;
// };

export type removeParticipantResponse = {
  status: boolean;
  response: string;
  callId?: string;
  participantId?: string;
  userIdOfParticipant?: string;
};
