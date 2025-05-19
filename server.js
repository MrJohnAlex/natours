const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION 🔥Shutting Down.....');
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000;

const DB_URL = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((con) => console.log('Connected...'));
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTIONS 🔥Shutting Down.....');
  server.close(() => {
    process.exit(1);
  });
});
