"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
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
    onOffer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            sdp,
            roomId,
        });
    }
    onAnswer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", {
            sdp,
            roomId,
        });
    }
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", { candidate, type });
    }
    onPrediction(prediction, roomId, userId) {
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
exports.RoomManager = RoomManager;
