import { Socket } from "socket.io";
import http from "http";
import express from "express";
import { Server } from "socket.io";
import { UserManager } from "./manager/UserManagers";

const app = express();
const server = http.createServer(app); // Use `app` here instead of `http`

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.status(200).send("Server is up and running");
});

const userManager = new UserManager();

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  console.log(socket.handshake.query);
  userManager.addUser(socket.handshake.query?.name as string, socket);
  socket.on("disconnect", () => {
    console.log("user disconnected");
    userManager.removeUser(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
