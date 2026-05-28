const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  institute: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true }
});

// Define schemas and models
const faceSchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true },
  descriptions: { type: Array, required: true },
});

const FaceModel = mongoose.model('Face', faceSchema);
module.exports = FaceModel;

const User = mongoose.model('User', userSchema);
module.exports = User;
