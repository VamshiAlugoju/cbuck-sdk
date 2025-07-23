// export const processorQues = {
//     CallQue: 'CallQue',
//   };
//   export const ProcessQues = {
//     ScheduleCall: 'ScheduleCall',
//     ScheduledCallNotification: 'ScheduledCallNotification',
//   };

export const Queues = {
  Call: 'CallQueue',
  Email: 'EmailQueue',
  Chat: 'ChatQueue',
};

export const CallJobs = {
  Schedule: 'Call.Schedule',
  NotifyScheduled: 'Call.NotifyScheduled',
  MonitorRoom: 'Call.MonitorRoom',
  // Follow pattern: 'Queue.Job'
};

export const ChatsJobs = {
  Schedule: 'Chats.Schedule',
};
