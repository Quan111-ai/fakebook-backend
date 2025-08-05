const mongoose = require('mongoose');

const InformationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Bỏ unique để cho phép nhiều bản ghi
  fullName: { type: String, required: true },
  hobbies: { type: String },
  hometown: { type: String },
  birthdate: { type: Date },
  phoneNumber: { type: String }
});

module.exports = mongoose.model('Information', InformationSchema);
