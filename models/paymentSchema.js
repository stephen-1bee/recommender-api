const mongoose = require("mongoose")

const payments = new mongoose.Schema({
  card_no: {
    type: String,
    require: true,
    default: null,
  },
  exprire: {
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

module.exports = mongoose.model("payments", payments, "payments")
