const express = require("express")
const { signin, signout, signup, verify_email } = require("../controllers/reviewerController");
const { check } = require("express-validator")
const reviewerAuth = require("../middleware/reviewerMiddleware")

const router = express.Router()

router.post('/signin', signin)

router.get("/signout", reviewerAuth, signout)

router.post("/signup", [
    check("name", "Name length must be greater than 3 characters").isLength({ min: 3 }),
    check("email", "Email should be valid").isEmail(),
    check("password", "Password must be greater that 6 characters").isLength({ min: 6 })
], signup)

router.post("/verify_email", verify_email)

module.exports = router