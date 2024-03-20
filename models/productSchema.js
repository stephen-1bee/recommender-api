const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
  photo: {
    type: String,
    require: true,
    defualt: null,
  },
  name: {
    type: String,
    require: true,
    defualt: null,
  },
  desc: {
    type: String,
    require: true,
    defualt: null,
  },
  price: {
    type: Number,
    require: true,
    defualt: 0,
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

module.exports = mongoose.model("productSchema", productSchema, "products")
