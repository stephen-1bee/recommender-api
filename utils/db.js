const mongoose = require("mongoose")

const con = async () => {
  try {
    await mongoose.connect(
      process.env.ROOM === "dev"
        ? process.env.DEV_DBSTRING
        : process.env.ROOM === "prod"
        ? process.env.PROD_DBSTRING
        : null
    )

    if (process.env.ROOM === "dev") {
      console.log("dev db connected successfully")
    } else if (process.env.ROOM === "prod") {
      console.log("remote db connected successfully")
    } else {
      console.log("invalid db connection")
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = con
