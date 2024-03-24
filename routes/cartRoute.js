const express = require("express")
const router = express.Router()
const cartSchema = require("../models/cartSchema")
const mongoose = require("mongoose")

// add cart
router.post("/create", async (req, res) => {
  try {
    // take reqs
    const { user_id, product_id } = req.body

    //   map to schema
    const newCart = new cartSchema({
      user_id,
      product_id,
    })

    // save
    const addCart = await newCart.save()

    if (addCart) {
      res.status(202).json({
        msg: "cart added successfully",
        added_cart: addCart,
      })
    } else {
      res.status(404).json({ msg: "failed to add cart" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// all cart
router.get("/all", async (req, res) => {
  try {
    // query
    const allCart = await cartSchema
      .aggregate([
        {
          $lookup: {
            from: "products",
            localField: "product_id",
            foreignField: "_id",
            as: "product",
          },
        },
      ])
      .sort({ dateCreated: -1 })

    if (allCart) {
      res.status(202).json({
        msg: "success",
        cart_count: allCart.length,
        carts: allCart,
      })
    } else {
      res.status(404).json({ msg: "cart not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// single
router.get("/one/:id", async (req, res) => {
  try {
    // query
    const oneCart = await cartSchema.aggregate({ _id: req.params.id })

    if (oneCart) {
      res.status(202).json({ msg: "success", cart: oneCart })
    } else {
      res.status(404).json({ msg: "category not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json("internal server error")
  }
})

// delete
router.delete("/delete/:id", async (req, res) => {
  try {
    // query
    const delCart = await cartSchema.findByIdAndDelete(req.params.id)

    if (delCart) {
      res.status(202).json({
        msg: "cart deleted successfully",
        category: delCart,
      })
    } else {
      res.status(404).json({ msg: "cart not found" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id

    const cart = await cartSchema.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product",
        },
      },
    ])

    res.status(200).json({ msg: "success", cart_count: cart.length, cart })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

module.exports = router
