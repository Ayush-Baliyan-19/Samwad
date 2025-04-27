"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManagers_1 = require("./RoomManagers");
class UserManager {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManagers_1.RoomManager();
    }
    addUser(name, socket) {
        console.log("inside add user", name, socket.id);
        this.users.push({
            name,
            socket,
        });
        this.queue.push(socket.id);
        socket.send("lobby");
        this.clearQueue();
        this.initHandlers(socket);
    }
    removeUser(socketId) {
        const user = this.users.find((x) => x.socket.id === socketId);
        this.users = this.users.filter((x) => x.socket.id !== socketId);
        this.queue = this.queue.filter((x) => x === socketId);
    }
    clearQueue() {
        console.log("inside clear queues");
        console.log(this.queue.length);
        if (this.queue.length < 2) {
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        console.log("id is " + id1 + " " + id2);
        const user1 = this.users.find((x) => x.socket.id === id1);
        const user2 = this.users.find((x) => x.socket.id === id2);
        console.log(user1 === null || user1 === void 0 ? void 0 : user1.name, user2 === null || user2 === void 0 ? void 0 : user2.name);
        if (!user1 || !user2) {
            return;
        }
        console.log("creating roonm");
        const room = this.roomManager.createRoom(user1, user2);
        this.clearQueue();
    }
    initHandlers(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        });
        socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
        socket.on("prediction", ({ prediction, roomId, userId }) => {
            this.roomManager.onPrediction(prediction, roomId, userId);
        });
    }
}
exports.UserManager = UserManager;
