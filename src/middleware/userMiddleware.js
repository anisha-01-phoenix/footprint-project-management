const jwt = require("jsonwebtoken");
const { query } = require("../../db");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedToken.id);
    const getUserQuery = 'SELECT * FROM users WHERE user_id = ?';
    const [user] = await query(getUserQuery, [decodedToken.id]);

    if (!user) {
      res.status(401).send({
        error: "Please Authenticate",
        success: false,
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      error: "Please Authenticate",
      success: false,
    });
  }
};

module.exports = auth;
