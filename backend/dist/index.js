"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const UserManagers_1 = require("./manager/UserManagers");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app); // Use `app` here instead of `http`
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
app.get("/", (req, res) => {
    res.status(200).send("Server is up and running");
});
const userManager = new UserManagers_1.UserManager();
io.on("connection", (socket) => {
    var _a;
    console.log("a user connected");
    console.log(socket.handshake.query);
    userManager.addUser((_a = socket.handshake.query) === null || _a === void 0 ? void 0 : _a.name, socket);
    socket.on("disconnect", () => {
        console.log("user disconnected");
        userManager.removeUser(socket.id);
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
