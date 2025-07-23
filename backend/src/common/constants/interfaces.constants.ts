export const Services = {
  AuthService: 'IAuthService',
  SessionService: 'ISessionService',
  UserService: 'IUserService',
  JwtService: 'IJwtService',
  SocketService: 'ISocketService',
  RedisService: 'IRedisService',
  CallService: 'ICallService',
  StreamService: 'IStreamService',
  ReportService: 'IReportService',
};

export const Repositories = {
  AuthRepository: 'IAuthRepository',
  UserRepository: 'IUserRepository',
  FeedbackRepository: 'IFeedbackRepository',
  LiveStreamRepository: 'ILiveStreamRepository',
  StreamChatRepository: 'IStreamChatRepository',
  StreamInteractionRepository: 'IStreamInteractionRepository',
};

// export const processorQues = {
//   CallQue: 'CallQue',
// };
// export const ProcessQues = {
//   ScheduleCall: 'ScheduleCall',
//   ScheduledCallNotification: 'ScheduledCallNotification',
// };
export enum CountryCode {
  IN = 'IN', // India
  US = 'US', // United States
  UK = 'UK', // United Kingdom
  CA = 'CA', // Canada
  AU = 'AU', // Australia
  AE = 'AE', // United Arab Emirates
  DE = 'DE', // Germany
  FR = 'FR', // France
  JP = 'JP', // Japan
  CN = 'CN', // China
}
