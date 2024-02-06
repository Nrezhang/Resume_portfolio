const express = require("express");
const { sendEmailController } = require("../controllers/portfolioController");

//router object
const router = express.Router();

//routes
router.post("/sendEmail", sendEmailController);

router.get("/test", (req, res) => {
    res.send("Testing route");
  });

// /export
module.exports = router;