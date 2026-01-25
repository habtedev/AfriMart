const connectDB = require("./src/DB/connectDB");
const app = require("./src/app");
require("dotenv").config();

const PORT = process.env.PORT ;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`);
  });
});
