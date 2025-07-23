// import { Inject, Injectable } from '@nestjs/common';
// import { Services } from 'src/common/constants/interfaces.constants';
// import { RedisService } from 'src/redis/services/redis.service';
// import ICallRedisService from './interfaces/call.redis.service.interface';

// @Injectable()
// export class CallRedisService implements ICallRedisService {
//   private readonly TTL = 86400; // 24 hours

//   constructor(
//     @Inject(Services.RedisService) private readonly redisService: RedisService,
//   ) {}

//   private async getRedisClient() {
//     await this.redisService.waitUntilReady();
//     return this.redisService.getClient();
//   }

//   async registerUsersOnCall(userIds: string[], roomId: string): Promise<void> {
//     const redis = await this.getRedisClient();
//     const pipeline = redis.pipeline();

//     for (const userId of userIds) {
//       const userKey = `user:onCall:${userId}`;
//       const roomKey = `room:onCall:${roomId}`;
//       pipeline.set(userKey, roomId, 'EX', this.TTL);
//       pipeline.sadd(roomKey, userId);
//       pipeline.expire(roomKey, this.TTL);
//     }

//     await pipeline.exec();
//   }

//   async getUsersRoomIds(userIds: string[]): Promise<(string | null)[]> {
//     const redis = await this.getRedisClient();
//     const keys = userIds.map((userId) => `user:onCall:${userId}`);
//     return await redis.mget(...keys);
//   }

//   async removeUsersFromCall(userIds: string[]): Promise<void> {
//     const redis = await this.getRedisClient();
//     const pipeline = redis.pipeline();

//     for (const userId of userIds) {
//       pipeline.get(`user:onCall:${userId}`);
//     }

//     const results = await pipeline.exec();
//     const pipeline2 = redis.pipeline();

//     for (let i = 0; i < userIds.length; i++) {
//       const userId = userIds[i];
//       const roomId = results?.[i][1];
//       const userKey = `user:onCall:${userId}`;
//       pipeline2.del(userKey);
//       if (roomId) {
//         const roomKey = `room:onCall:${roomId}`;
//         pipeline2.srem(roomKey, userId);
//       }
//     }

//     await pipeline2.exec();
//   }

//   async removeAllUsersFromRoom(roomId: string): Promise<void> {
//     const redis = await this.getRedisClient();
//     const roomKey = `room:onCall:${roomId}`;
//     const userIds = await redis.smembers(roomKey);

//     const pipeline = redis.pipeline();
//     for (const userId of userIds) {
//       pipeline.del(`user:onCall:${userId}`);
//     }

//     pipeline.del(roomKey);
//     await pipeline.exec();
//   }

//   async getAllUsersInRoom(roomId: string): Promise<string[]> {
//     const redis = await this.getRedisClient();
//     return await redis.smembers(`room:onCall:${roomId}`);
//   }
// }
