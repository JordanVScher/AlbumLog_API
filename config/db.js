const mongoose = require('mongoose');


const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
  });

  console.log(`MongoDB Connect: ${conn.connection.host}`);
};

module.exports = connectDB;
