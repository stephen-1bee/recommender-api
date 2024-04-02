const router = require("express").Router()
const productSchema = require("../models/productSchema")
const mongoose = require("mongoose")
const cloudinary = require("../utils/cloudinary")
const upload = require("../middleware/multer")

// create
router.post("/create", upload.single("photo"), async (req, res) => {
  try {
    const { name, desc, price, no_cart, views } = req.body

    if (!req.file) {
      res.status(404).json({ msg: "photo is required" })
    }

    const photo = (await cloudinary.uploader.upload(req.file.path)).secure_url

    const newProduct = new productSchema({
      photo,
      name,
      desc,
      price,
      no_cart,
      views,
    })

    const product = await newProduct.save()

    if (product) {
      res.status(200).json({ msg: "product created successfully", product })
    } else {
      res.status(404).json({ msg: "failed to create product" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json("internal server error")
  }
})

router.get("/all", async (req, res) => {
  try {
    const products = await productSchema.find()

    res
      .status(200)
      .json({ msg: "success", product_count: products.length, products })
  } catch (err) {
    console.log(err)
    res.status(500).json("internal server error")
  }
})

// single product
router.get("/one/:id", async (req, res) => {
  try {
    const productId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(401).json({ msg: "product id not found" })
    }

    const product = await productSchema.findOne({ _id: productId })

    // increase views
    const view = await productSchema.findByIdAndUpdate(productId, {
      $inc: { views: 1 },
    })

    if (product && view) {
      res.json({ msg: "success", product })
    } else {
      res.json({ msg: "failed to get single product" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

// delete
router.delete("/delete/:id", async (req, res) => {
  try {
    const productId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(401).json({ msg: "product id not found" })
    }

    const product = await productSchema.findByIdAndDelete(productId)

    if (product) {
      res.status(200).json({ msg: "product deleted successfully" })
    } else {
      res.status(404).json({ msg: "failed to delete user" })
    }
  } catch (err) {
    console.log(err)
  }
})

// update
router.put("/update/:id", upload.single("photo"), async (req, res) => {
  try {
    const productId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(401).json({ msg: "user id not found" })
    }

    const { name, desc, price } = req.body

    const currentProduct = await productSchema.findOne({ _id: productId })
    const currentPhoto = currentProduct.photo

    const uploadedPhoto = (await cloudinary.uploader.upload(req.file.path))
      .secure_url

    const finalPhoto = req.file ? uploadedPhoto : currentPhoto

    const product = await productSchema.updateOne(
      { _id: productId },
      { $set: { photo: finalPhoto, name, desc, price } }
    )

    if (product.modifiedCount === 1) {
      res.status(200).json({ msg: "product updated successfully" })
    } else {
      res.status(404).json({ msg: "failed to update product" })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

router.get("/recommended", async (req, res) => {
  try {
    const recommended = await productSchema.find({
      no_cart: { $gte: 5 },
      views: { $gte: 5 },
    })

    res.json({ msg: "success", recommended })
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "internal server error" })
  }
})

module.exports = router
