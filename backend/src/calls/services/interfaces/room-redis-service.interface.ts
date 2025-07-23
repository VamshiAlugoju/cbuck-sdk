export interface IRoomRedisService {
  addRoom(roomId: string): Promise<number>;
  isRoomExists(roomId: string): Promise<boolean>;
  removeRoom(roomId: string): Promise<number>;
  getAllRooms(): Promise<string[]>;
  clearAllRooms(): Promise<number>;
//   waitUntilReady(): Promise<void>;
}
