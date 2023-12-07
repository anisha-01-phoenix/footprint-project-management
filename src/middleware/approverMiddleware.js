const jwt = require("jsonwebtoken");
const Approver = require("../models/approver");
require("express-validator");
require('express-jwt');

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const approver = await Approver.findOne({ '_id': decodedToken._id }).exec();
    
    if (!approver) {
      res.status(401).send({
        error: "Please Authenticate"
      });
    } else {
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(401).send({
      error: "Please Authenticate"
    });
  }
};

module.exports = auth;