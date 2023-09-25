const router = require("express").Router();
const jwt = require("jsonwebtoken");
const md5 = require("md5");

// Importing user defined files and functions
const STUDENT = require("../Models/student");
const FACULTY = require("../Models/faculty");
const protected = require("../protected");
const OTPgenerator = require("../functions-and-middlewares/OTPgenerator");
const send_OTP = require("../functions-and-middlewares/send_otp");

router.post("/register", async(req,res) => {
    try {
        // console.log(req.body.newName, req.body.newEmail, req.body.newPassword, req.body.confirmPassword);
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
        const foundStudent = await STUDENT.findOne({email: req.body.newEmail});
        const foundFaculty = await FACULTY.findOne({email: req.body.newEmail});
        if(foundStudent || foundFaculty) {
            return res.status(400).render("homepage", {
                message: "User with entered email already exists."
            });
        }
        const OTP = OTPgenerator();
        console.log(`This is the OTP: ${OTP}.`);
        const encodedJWT = jwt.sign({userDetails: req.body, otp: OTP}, protected.SECRET_KEY);
        res.cookie("studentDetails_and_OTP", encodedJWT);
        send_OTP(req.body.newEmail, OTP);
        return res.status(200).render("verify_otp", {
            message: "",
            route: "/student/OTP"
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
        const receivedToken = req.cookies.studentDetails_and_OTP;
        if(!receivedToken) {
            return res.status(401).json({message: "Something went wrong."});
        }
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        if(req.body.newOTP == decodedJWT.otp) {
            const createdUser = new STUDENT({
                name: decodedJWT.userDetails.newName,
                email: decodedJWT.userDetails.newEmail,
                password: md5(decodedJWT.userDetails.newPassword)
            });
            await createdUser.save();
            res.clearCookie("studentDetails_and_OTP");
            return res.status(201).render("homepage", {
                message: "Registration successful. You can now login as a student."
            });
        }
        else {
            return res.status(400).render("verify_otp", {
                message: "Incorrect OTP.",
                route: "/student/OTP"
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
            return res.status(400).render("homepage", {
                message: "Please fill all the required fields."
            });
        }
        const tempUser = await STUDENT.findOne({email: req.body.userEmail});
        if(!tempUser) {
            return res.status(400).render("homepage", {
                message: "User with entered details doesn't exists."
            });
        }
        if(tempUser.password !== md5(req.body.userPassword)) {
            return res.status(400).render("homepage", {
                message: "Incorrect password."
            });
        }
        const jwtToken = jwt.sign({ID: tempUser._id}, protected.SECRET_KEY);
        res.cookie("JWT_token_student", jwtToken);
        return res.status(200).render("student-dashboard", {
            name: tempUser.name
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).render("homepage", {
            message: "Something went wrong, try again."
        });
    }
});

module.exports = router;