const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(cors());

io.on("connection", (socket) => {
  socket.on("connect", (data) => {
    console.log("data", data);
  });

  socket.on("customer-create-new-order", (order) => {
    io.emit(`send-order-to-merchant-${order.merchantId}`, order);
  });

  socket.on("merchant-accepted-order", (order) => {
    const updatedOrder = {
      ...order,
      status: "Accepted",
      updatedTime: new Date(new Date().toUTCString()),
    };
    io.emit(`updated-order-status-to-customer-${order.userId}`, updatedOrder);
  });

  socket.on("assign-order-to-driver", (order) => {
    io.emit("wait-driver-accept-order", order);
  });

  socket.on("driver-accepted-order", (order) => {
    const updatedOrder = {
      ...order,
      status: "Delivering",
      updatedTime: new Date(new Date().toUTCString()),
    };
    io.emit(`driver-delivering-order-${order.userId}`, updatedOrder);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(process.env.PORT, () => {
  console.log("Server socket listening on port", process.env.PORT);
});
