const jwt = require("jsonwebtoken");
const { query } = require("../../db");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const getApproverQuery = 'SELECT * FROM approvers WHERE approver_id = ?';
    const [approver] = await query(getApproverQuery, [decodedToken.id]);

    if (!approver) {
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
