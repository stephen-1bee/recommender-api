const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    default: null,
  },
  email: {
    type: String,
    require: true,
    default: null,
  },
  password: {
    type: String,
    require: true,
    default: null,
  },
  hasCard: {
    type: Boolean,
    require: true,
    default: false,
  },
  dateCreated: {
    type: Date,
    require: true,
    default: new Date(),
  },
  dateUpdated: {
    type: Date,
    require: true,
    default: new Date(),
  },
})

module.exports = mongoose.model("userSchema", userSchema, "users")
