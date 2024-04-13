const router = require("express").Router()
const userSchema = require("../models/userSchema")
const { check, validationResult } = require("express-validator")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")

// create
router.post(
  "/create",
  [
    check("email").isEmail().withMessage("provide a valid email fornat"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters long.")
      .matches(/[a-zA-Z]/)
      .withMessage("Password should contain at least one letter.")
      .matches(/\d/)
      .withMessage("Password should contain at least one numeric digit."),
  ],
  async (req, res) => {
    try {
      const { username, password, email } = req.body

      const usernameExist = await userSchema.findOne({ username })
      const emailExists = await userSchema.findOne({ email })

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const error = errors.array().map((err) => err.msg)
        return res.status(401).json({ msg: error[0] })
      }

      const hashPassword = await bcrypt.hash(password, 10)

      if (emailExists) {
        return res.status(401).json({ msg: "Email already exists" })
      }

      if (usernameExist) {
        return res.status(401).json({ msg: "username already exists" })
      }

      const newUser = new userSchema({
        username,
        password: hashPassword,
        email,
      })

      if (newUser) {
        const user = await newUser.save()
        res.status(200).json({ msg: "User created successfully", user })
      } else {
        res.status(404).json({ msg: "failed to create user" })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json("internal server error")
    }
  }
)

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await userSchema.findOne({ email })

    if (!user) {
      return res.status(401).json({ msg: "user does not exist" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ msg: "incorrect password" })
    }

    res.status(200).json({ msg: "login successful", user })
  } catch (err) {
    console.log(err)
    res.status(500).json("internal server error")
  }
})

router.get("/all", async (req, res) => {
  try {
    const users = await userSchema.find()

    res.status(200).json({ msg: "success", user_count: users.length, users })
  } catch (err) {
    console.log(err)
    res.status(500).json("internal server error")
  }
})

// delete
router.delete("/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ msg: "user id not found" })
    }

    const user = await userSchema.findByIdAndDelete(userId)

    if (user) {
      res.status(200).json({ msg: "user deleted successfully" })
    } else {
      res.status(404).json({ msg: "failed to delete user" })
    }
  } catch (err) {
    console.log(err)
  }
})

// update
router.put("/update/:id", async (req, res) => {
  try {
    const userId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ msg: "user id not found" })
    }

    const { email, username, password } = req.body

    const currentUser = await userSchema.findOne({ _id: userId })

    const user = await userSchema.updateOne(
      { _id: userId },
      { $set: { email, username } }
    )

    if (user.modifiedCount === 1) {
      res.status(200).json({ msg: "user updated successfully" })
    } else {
      res.status(404).json({ msg: "failed to  update user" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.get("/one/:id", async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.params.id })
    res.json({ msg: "success", user })
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
