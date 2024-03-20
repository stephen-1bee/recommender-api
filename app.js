const express = require("express")
const helmet = require("helmet")
const morgan = require("morgan")
const dotenv = require("dotenv")
const con = require("./utils/db")
const app = express()

// configs
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))
app.use(helmet())
dotenv.config()

con()

// route imports
const userRoute = require("./routes/userRoute")
const productRoute = require("./routes/productsRoute")

// endpoints
app.use("/api/v1/users", userRoute)
app.use("/api/v1/products", productRoute)

//welcome
app.get("/", async (req, res) => {
  res.json({ msg: "Welcome to product recommendation api service" })
})

port = process.env.PORT
app.listen(port, () => console.log(`listing on port ${port}`))
