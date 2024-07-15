var express = require("express");
var router = express.Router();

/* Training */
router.get("/", function (req, res, next) {
    res.render("./index", { decoded: "a" });
});


module.exports = router