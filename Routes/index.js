const router = require("express").Router();

router.get("/", (req,res) => {
    res.status(200).render("homepage", {
        message: ""
    });
});

module.exports = router;