const connectDB = require("./src/DB/connectDB");
const app = require("./src/app");
require("dotenv").config();

const PORT = process.env.PORT ;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
