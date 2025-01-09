const path = require("path");
const WebSocket = require("ws");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
    ],
  },
  devServer: {
    static: "./dist",
    onListening: (devServer) => {
      if (!devServer) {
        throw new Error("Webpack Dev Server is not defined");
      }

      const server = devServer.server;

      const webSocketsServer = new WebSocket.Server({ port: 8081 });

      webSocketsServer.on("connection", (ws) => {
        console.log("New WebSocket connection");

        ws.on("message", (message) => {
          console.log(`Received message: ${message}`);

          webSocketsServer.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        });

        ws.on("close", () => {
          console.log("WebSocket client disconnected");
        });
      });
    },
  },
};