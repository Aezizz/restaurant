import { app, server, PORT } from "./app.js";

// Jalankan HTTP Server
server.listen(PORT, () => {
  console.log(
    `🚀 Server backend & WebSocket berjalan di http://localhost:${PORT}`,
  );
});
