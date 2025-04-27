import { User } from "./UserManagers";

let GLOBAL_ROOM_ID = 1;

interface Room {
  user1: User;
  user2: User;
}

export class RoomManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();
    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    });

    user1.socket.emit("send-offer", {
      roomId,
    });

    user2.socket.emit("send-offer", {
      roomId,
    });
  }

  onOffer(roomId: string, sdp: string, senderSocketid: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
    receivingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  onAnswer(roomId: string, sdp: string, senderSocketid: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;

    receivingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  onIceCandidates(
    roomId: string,
    senderSocketid: string,
    candidate: any,
    type: "sender" | "receiver"
  ) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
    receivingUser.socket.emit("add-ice-candidate", { candidate, type });
  }

  onPrediction(prediction: string, roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const user1 = room.user1.socket.id;
    const user2 = room.user2.socket.id;
    if (user1 === userId) {
      room.user1.socket.emit("prediction", {
        prediction,
        userId: room.user2.socket.handshake.query.name,
      });
      return;
    }
    if (user2 === userId) {
      room.user2.socket.emit("prediction", {
        prediction,
        userId: room.user1.socket.handshake.query.name,
      });
      return;
    }
  }

  generate() {
    return GLOBAL_ROOM_ID++;
  }
}
