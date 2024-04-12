const router = require("express").Router()
const { check, validationResult } = require("express-validator")
const payment = require("../models/paymentSchema")

// make payment
router.post(
  "/create",
  [
    check("card_no")
      .isLength({ max: 14 })
      .withMessage("Card number must be at least 14 characters")
      .isNumeric()
      .withMessage("card must be numeric characters"),

    check("cvc")
      .isLength({ min: 3, max: 3 })
      .withMessage("cvc number must be at least 3 characters"),
  ],
  async (req, res) => {
    try {
      const { card_no, expire, cvc } = req.body

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const error = errors.array().map((err) => err.msg)
        return res.status(402).json({ msg: error[0] })
      }

      const newPayment = new payment({
        card_no,
        expire,
        cvc,
      })

      if (newPayment) {
        // save
        const savePayment = await newPayment.save()
        res.status(200).json({ msg: "Payment made successfully" })
      } else {
        res.status(404).json({ msg: "failed to make payment" })
      }
    } catch (err) {
      console.log(err)
      res.status(404).json({ msg: "internal server error" })
    }
  }
)

// all payments
router.get("/all", async (req, res) => {
  try {
    const payments = await payment.find()
    res.status(200).json({ msg: "success", payments })
  } catch (err) {
    console.log(err)
    res.status(404).json({ msg: "internal server error" })
  }
})

module.exports = router
