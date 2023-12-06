const express = require("express")
const { signup, signin, signout, verify_email } = require("../controllers/userController");
const { check } = require("express-validator")
const userAuth = require("../middleware/userMiddleware")
const router = express.Router()

router.post('/signup', [
    check("name", "Name length must be greater than 3 characters").isLength({ min: 3 }),
    check("email", "Email should be valid").isEmail(),
    check("password", "Password must be greater that 6 characters").isLength({ min: 6 }),
    check("apostolate", "Invalid apostolate").isIn(['social', 'education', 'health', 'others'])
], signup)

router.post('/signin', signin)

router.get("/signout", userAuth, signout)

router.post("/verify_email", verify_email)

module.exports = router