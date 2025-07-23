interface ICallRedisService {
  registerUsersOnCall(userIds: string[], roomId: string): Promise<void>;
  removeUsersFromCall(userIds: string[]): Promise<void>;
  getUsersRoomIds(userIds: string[]): Promise<(string | null)[]>;
  removeAllUsersFromRoom(roomId: string): Promise<void>;
  getAllUsersInRoom(roomId: string): Promise<string[]>;

}

export default ICallRedisService;
