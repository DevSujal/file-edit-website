import "dotenv/config";
import { connectDB } from "./db/index.js";
import { conf } from "./conf.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(conf.port, () => {
      console.log("Server is running on port", conf.port);
    });
  })
  .catch((error) => {
    console.log("Error connecting to the server", error);
  });
