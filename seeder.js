require('dotenv').config({ path: './config/.env' }); // load env
const fs = require('fs');
const mongoose = require('mongoose');

const Album = require('./models/Album');


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
  dbName: process.env.DB_NAME,
});

const albums = JSON.parse(fs.readFileSync('./_data/albums.json', 'utf-8'));


const importData = async () => {
  try {
    await Album.create(albums);

    console.log('Data imported...');
    process.exit();
  } catch (error) {
    console.log('error', error);
    process.exit();
  }
};


const deleteData = async () => {
  try {
    await Album.deleteMany();

    console.log('Data deleted...');
    process.exit();
  } catch (error) {
    console.log('error', error);
    process.exit();
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
