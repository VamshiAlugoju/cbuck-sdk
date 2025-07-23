// import { Injectable, Logger } from '@nestjs/common';
// import { Job } from 'bullmq';
// import { BullmqProcessor } from '../bullmq/decorators/processor.decorator';
// import CallService from './services/implementations/calls.service';
// import { Queues, CallJobs } from 'src/common/constants/que.constant';

// @Injectable()
// export class CallProcessor {
//   constructor(private readonly callService: CallService) {}
//   @BullmqProcessor(Queues.Call, CallJobs.Schedule)
//   async handleScheduledCall(job: Job) {
//     Logger.log(
//       `job with id ${job.id} called for scheduled call at`,
//       new Date(),
//     );
//     this.callService
//       .handleScheduledCall(job.data)
//       .catch((e) => Logger.error(`error in handleScheduledCall ${e.message}`));
//   }

//   @BullmqProcessor(Queues.Call, CallJobs.NotifyScheduled)
//   async handleScheduledCallReminder(job: Job) {
//     this.callService
//       .handleScheduledCallReminder(job.data)
//       .catch((e) =>
//         Logger.error(`error from handleScheduledCallReminder ${e.message} `),
//       );
//   }

//   @BullmqProcessor(Queues.Call, CallJobs.MonitorRoom)
//   async handleOngoingCall(job: Job) {
//     this.callService.monitorRoom().catch((e) => {
//       Logger.error(`error from monitorRoom ${e?.message}`);
//     });
//   }
// }
