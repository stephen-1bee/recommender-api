const mongoose = require("mongoose")

const con = async (req, res) => {
  try {
    await mongoose.connect(process.env.DB_STRING)
    console.log("dev db connection established")
  } catch (err) {
    console.log(err)
  }
}

module.exports = con
