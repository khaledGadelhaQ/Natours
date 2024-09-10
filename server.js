const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception \nServer Shutting down...🔴🔴');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require(`./app`);
const DB = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD);

// connecting to our database.
mongoose.connect(DB).then(() => {
  console.log('Connected to MongoDB 🤯');
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Listning on port ${port}: :)`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection \nServer Shutting down...🔴🔴');
  console.log(err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
