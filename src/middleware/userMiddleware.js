const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ '_id': decodedToken._id });

    if (!user) {
      res.status(401).send({
        error: "Please Authenticate"
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      error: "Please Authenticate"
    });
  }
};

module.exports = auth;
