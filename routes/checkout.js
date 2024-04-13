const router = require("express").Router()
const { check, validationResult } = require("express-validator")
const checkoutSchema = require("../models/checkoutSchema")
const userSchema = require("../models/userSchema")
const mongoose = require("mongoose")
const productSchema = require("../models/productSchema")

// add card
router.post(
  "/add-card",
  [
    check("card_no")
      .isCreditCard()
      .withMessage("Please provide a valid credit card number"),
    check("expire")
      .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
      .withMessage("Please provide a valid expiration date in MM/YY format"),
    check("cvc")
      .isLength({ min: 3, max: 3 })
      .withMessage("Please provide a valid CVC"),
    check("amount").isNumeric().withMessage("Please provide a valid amount"),
  ],
  async (req, res) => {
    try {
      const { user_id, card_no, expire, cvc, amount } = req.body

      const newCard = new checkoutSchema({
        user_id,
        card_no,
        expire,
        cvc,
        amount,
      })

      //
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const error = errors.array().map((err) => err.msg)
        return res.status(401).json({ msg: error[0] })
      }

      const hasCard = await userSchema.findByIdAndUpdate(user_id, {
        $set: { hasCard: true },
      })

      if (newCard) {
        const save_card = await newCard.save()
        res.status(200).json({ msg: "Card saved successfully" })
      } else {
        res.status(4040).json({ msg: "failed to add card, Try again " })
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({ msg: "internal server error" })
    }
  }
)

// get card by user id
router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(401).json({ msg: "invalid user id" })
    }

    const user_card = await checkoutSchema.findOne({ user_id: userId })
    res.status(200).json({ msg: "sucess", user_card })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// make payment
router.post("/payment/:productId", async (req, res) => {
  try {
    const { user_id } = req.body
    const productId = req.params.productId

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(401).json({ msg: "invalid product id" })
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      res.status(401).json({ msg: "invalid user id" })
    }

    // find user
    const user_card = await checkoutSchema.findOne({ user_id: user_id })
    const user_amount = user_card.amount
    // find product
    const product = await productSchema.findOne({ _id: productId })
    const product_amount = product.price

    // // deduct
    if (user_amount > product_amount) {
      const balance = user_amount - product_amount

      // update user card amount
      const updateUserAmount = await checkoutSchema.findByIdAndUpdate(
        user_card._id,
        { $set: { amount: balance } }
      )
      res.status(200).json({
        msg: `Payment made successfully, You have ${balance} in your card `,
      })
    } else {
      res
        .status(401)
        .json({ msg: "insufficient balance, Top up card to purchase" })
    }

    // res.json({ user_amount, product_amount })
  } catch (err) {
    console.log(err)
    res.status(404).json({ msg: "internal server error" })
  }
})

// all payments
router.get("/all", async (req, res) => {
  try {
    const payments = await checkoutSchema.find()
    res.status(200).json({ msg: "success", payments })
  } catch (err) {
    console.log(err)
    res.status(404).json({ msg: "internal server error" })
  }
})

// update user card
router.put("/card/update/:id", async (req, res) => {
  try {
    const cardId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      res.status(401).json({ msg: "invalid card id" })
    }
    const { card_no, expire, cvc, amount } = req.body

    const updateCard = await checkoutSchema.updateOne(
      { _id: cardId },
      { $set: { card_no, expire, cvc, amount } }
    )
    if (updateCard.modifiedCount === 1) {
      res.status(200).json({ msg: "card updated successfully" })
    } else {
      res.status(404).json({ msg: "failed to update card" })
    }
  } catch (err) {
    console.log(err)
  }
})

// delete
router.delete("/delete/:id", async (req, res) => {
  try {
    const cardId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(cardId)) {
      return res.status(401).json({ msg: "card id not found" })
    }

    const card = await checkoutSchema.findByIdAndDelete(cardId)

    if (card) {
      res.status(200).json({ msg: "card deleted successfully", card })
    } else {
      res.status(404).json({ msg: "failed to delete user" })
    }
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
