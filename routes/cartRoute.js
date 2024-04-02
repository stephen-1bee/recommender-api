const express = require("express")
const router = express.Router()
const cartSchema = require("../models/cartSchema")
const mongoose = require("mongoose")
const productSchema = require("../models/productSchema")

// add cart
router.post("/create", async (req, res) => {
  try {
    // Take request parameters
    const { user_id, product_id } = req.body

    // Check if the item already exists in the cart
    const existingCartItem = await cartSchema.findOne({ user_id, product_id })

    // If the item already exists, send a message indicating it
    if (existingCartItem) {
      res.status(400).json({
        msg: "Item already exists in the cart",
      })
    }
    // If the item doesn't exist, add it to the cart
    else {
      const newCart = new cartSchema({
        user_id,
        product_id,
      })

      const addCart = await newCart.save()

      // increase views
      const cart = await productSchema.findByIdAndUpdate(product_id, {
        $inc: { no_cart: 1 },
      })

      if (addCart && cart) {
        res.status(202).json({
          msg: "Cart added successfully",
          added_cart: addCart,
        })
      } else {
        res.status(500).json({ msg: "Failed to add cart" })
      }
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Internal server error" })
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
