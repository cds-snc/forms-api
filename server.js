import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log("Server Listening on port:", port);
});
