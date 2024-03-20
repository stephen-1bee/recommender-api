const mongoose = require("mongoose")

const con = async (req, res) => {
  try {
    await mongoose.connect(
      process.env.ROOM === "prod"
        ? process.env.PROD_STRING
        : process.env.ROOM === "dev"
        ? process.env.DEV_STRING
        : null
    )

    if (process.env.ROOM === "dev") {
      console.log("dev db connection established")
    } else if (process.env.PROD_STRING) {
      console.log("prod db connection established")
    } else {
      console.log("invalid db connection")
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = con
