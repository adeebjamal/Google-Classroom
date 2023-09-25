const router = require("express").Router();
const jwt = require("jsonwebtoken");
const md5 = require("md5");

// Importing user defined files and functions
const OTPgenerator = require("../functions-and-middlewares/OTPgenerator");
const protected = require("../protected");
const FACULTY = require("../Models/faculty");
const send_OTP = require("../functions-and-middlewares/send_otp");

// ---------- POST routes ----------
router.post("/register", async(req,res) => {
    try {
        if(!req.body.newName || !req.body.newEmail || !req.body.newPassword || !req.body.confirmPassword) {
            return res.status(400).render("homepage", {
                message: "Please fill all the required fields."
            });
        }
        if(req.body.newPassword !== req.body.confirmPassword) {
            return res.status(400).render("homepage", {
                message: "Passwords doesn't match."
            });
        }
        if(req.body.newPassword.length < 6) {
            return res.status(400).render("homepage", {
                message: "Password is too weak."
            });
        }
        const foundfaculty = await FACULTY.findOne({email: req.body.newEmail});
        if(foundfaculty) {
            return res.status(400).render("homepage", {
                message: "User with entered email already exists."
            });
        }
        const OTP = OTPgenerator();
        console.log(`This is the OTP: ${OTP}.`);
        const encodedJWT = jwt.sign({userDetails: req.body, otp: OTP}, protected.SECRET_KEY);
        send_OTP(req.body.newEmail, OTP);
        res.cookie("userDetails_and_OTP", encodedJWT);
        res.status(200).render("verify_otp", {
            message: "",
            route: "/faculty/OTP"
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).render("homepage", {
            message: "Something went wrong, try again."
        });
    }
});

router.post("/OTP", async(req,res) => {
    try {
        const receivedToken = req.cookies.userDetails_and_OTP;
        if(!receivedToken) {
            return res.status(401).json({message: "Something went wrong."});
        }
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        if(req.body.newOTP == decodedJWT.otp) {
            const createdUser = new FACULTY({
                name: decodedJWT.userDetails.newName,
                email: decodedJWT.userDetails.newEmail,
                password: md5(decodedJWT.userDetails.newPassword)
            });
            await createdUser.save();
            res.clearCookie("userDetails_and_OTP");
            return res.status(201).render("homepage", {
                message: "Registration successful. You can now login as a faculty."
            });
        }
        else {
            return res.status(401).render("verify_otp", {
                message: "Incorrect OTP.",
                route: "/faculty/OTP"
            });
        }
    }
    catch(error) {
        console.log(error);
        return res.status(500).render("homepage", {
            message: "Something went wrong, try again."
        });
    }
});

router.post("/login", async(req,res) => {
    try {
        if(!req.body.userEmail || !req.body.userPassword) {
            return res.status(401).render("homepage", {
                message: "Please fill all the required fields."
            });
        }
        const tempfaculty = await FACULTY.findOne({email: req.body.userEmail});
        if(!tempfaculty) {
            return res.status(400).render("homepage", {
                message: "User with entered details doesn't exists."
            });
        }
        if(tempfaculty.password !== md5(req.body.userPassword)) {
            return res.status(400).render("homepage", {
                message: "Incorrect password."
            });
        }
        const jwtToken = jwt.sign({ID: tempfaculty._id}, protected.SECRET_KEY);
        res.cookie("JWT_token", jwtToken);
        return res.status(200).render("faculty-dashboard", {
            name: tempfaculty.name
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).render("homepage", {
            message: "Something went wrong, try again."
        });
    }
});

module.exports = router;