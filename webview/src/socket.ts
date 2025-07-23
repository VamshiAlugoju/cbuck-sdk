import { io } from "socket.io-client";
// Connect to backend (localhost:3000 as given) with an optional query for userId.
export const socket = io("http://localhost:3000", {
  // you might pass auth or query like { auth: { userId: myId } }
});
