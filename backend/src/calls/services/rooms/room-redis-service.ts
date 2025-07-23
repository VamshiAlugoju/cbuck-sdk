// import { Inject, Injectable } from '@nestjs/common';
// import { Services } from 'src/common/constants/interfaces.constants';
// import { RedisService } from 'src/redis/services/redis.service';
// import { IRoomRedisService } from '../interfaces/room-redis-service.interface';

// @Injectable()
// export class RoomRedisService implements IRoomRedisService {
//   private readonly ROOM_SET_KEY = 'active_rooms';
//   private readonly TTL = 86400; // 24 hours

//   constructor(
//     @Inject(Services.RedisService) private readonly redisService: RedisService,
//   ) {}

//   // ✅ Proper async method instead of invalid async getter
//   private async getRedisClient() {
//     await this.redisService.waitUntilReady();
//     return this.redisService.getClient();
//   }

//   async addRoom(roomId: string): Promise<number> {
//     const redis = await this.getRedisClient();
//     return await redis.sadd(this.ROOM_SET_KEY, roomId);
//   }

//   async isRoomExists(roomId: string): Promise<boolean> {
//     const redis = await this.getRedisClient();
//     const exists = await redis.sismember(this.ROOM_SET_KEY, roomId);
//     return exists === 1;
//   }

//   async removeRoom(roomId: string): Promise<number> {
//     const redis = await this.getRedisClient();
//     return await redis.srem(this.ROOM_SET_KEY, roomId);
//   }

//   async getAllRooms(): Promise<string[]> {
//     const redis = await this.getRedisClient();
//     return await redis.smembers(this.ROOM_SET_KEY);
//   }

//   async clearAllRooms(): Promise<number> {
//     const redis = await this.getRedisClient();
//     return await redis.del(this.ROOM_SET_KEY);
//   }

// //   async waitUntilReady(): Promise<void> {
// //     return this.redisService.waitUntilReady();
// //   }
// }
