const mongoose = require("mongoose")

const checkoutSchema = new mongoose.Schema({
  card_no: {
    type: String,
    require: true,
    default: null,
  },
  expire: {
    type: String,
    require: true,
    default: null,
  },
  cvc: {
    type: String,
    require: true,
    default: null,
  },
  amount: {
    type: Number,
    require: true,
    default: 0,
  },
  user_id: {
    type: String,
    require: true,
    default: null,
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

module.exports = mongoose.model("payments", checkoutSchema, "payments")
