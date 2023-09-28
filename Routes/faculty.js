const router = require("express").Router();
const jwt = require("jsonwebtoken");
const md5 = require("md5");

// Importing user defined files and functions
const OTPgenerator = require("../functions-and-middlewares/OTPgenerator");
const protected = require("../protected");
const FACULTY = require("../Models/faculty");
const STUDENT = require("../Models/student");
const CLASSROOM = require("../Models/classroom");
const send_OTP = require("../functions-and-middlewares/send_otp");

// ---------- GET routes ----------
router.get("/logout", async(req,res) => {
    try {
        res.clearCookie("JWT_token_faculty");
        res.status(200).render("homepage", {
            message: "Logout successful."
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).render("homepage", {
            message: "Something went wrong, try again."
        });
    }
});

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
        const foundStudent = await STUDENT.findOne({email: req.body.newEmail});
        if(foundfaculty || foundStudent) {
            return res.status(400).render("homepage", {
                message: "User with entered email already exists."
            });
        }
        const OTP = OTPgenerator();
        console.log(`This is the OTP: ${OTP}.`);
        const encodedJWT = jwt.sign({userDetails: req.body, otp: OTP}, protected.SECRET_KEY);
        res.cookie("userDetails_and_OTP", encodedJWT);
        send_OTP(req.body.newEmail, OTP);
        return res.status(200).render("verify_otp", {
            message: "",
            route: "/faculty/OTP"
        });
    }
    catch(error) {
        console.log(error);
        if(req.cookies.JWT_token_faculty) {
            res.clearCookie("JWT_token_faculty");
        }
        if(req.cookies.JWT_token_student) {
            res.clearCookie("JWT_token_student");
        }
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
        if(req.cookies.JWT_token_faculty) {
            res.clearCookie("JWT_token_faculty");
        }
        if(req.cookies.JWT_token_student) {
            res.clearCookie("JWT_token_student");
        }
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
        res.cookie("JWT_token_faculty", jwtToken);
        const facultyClassrooms = await CLASSROOM.find({facultyID: tempfaculty._id});
        return res.status(200).render("faculty-dashboard", {
            name: tempfaculty.name,
            message: "",
            classrooms: facultyClassrooms
        });
    }
    catch(error) {
        console.log(error);
        if(req.cookies.JWT_token_faculty) {
            res.clearCookie("JWT_token_faculty");
        }
        if(req.cookies.JWT_token_student) {
            res.clearCookie("JWT_token_student");
        }
        res.status(500).render("homepage", {
            message: "Something went wrong, try again."
        });
    }
});

router.post("/classroom", async(req,res) => {
    try {
        const receivedToken = req.cookies.JWT_token_faculty;
        if(!receivedToken) {
            return res.status(400).render("homepage", {
                message: "You need to login first."
            });
        }
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        const foundFaculty = await FACULTY.findOne({_id: decodedJWT.ID});
        if(!req.body.classroomName || !req.body.classroomDescription) {
            return res.status(400).render("faculty-dashboard", {
                name: foundFaculty.name,
                message: "Please fill all the required fields.",
                classrooms: facultyClassrooms
            });
        }
        const createdClassroom = new CLASSROOM({
            name: req.body.classroomName,
            description: req.body.classroomDescription,
            facultyID: foundFaculty._id
        });
        await createdClassroom.save();
        const facultyClassrooms = await CLASSROOM.find({facultyID: foundFaculty._id});
        return res.status(201).render("faculty-dashboard", {
            name: foundFaculty.name,
            message: "Classroom created successfully.",
            classrooms: facultyClassrooms
        });
    }
    catch(error) {
        console.log(error);
        if(req.cookies.JWT_token_faculty) {
            res.clearCookie("JWT_token_faculty");
        }
        if(req.cookies.JWT_token_student) {
            res.clearCookie("JWT_token_student");
        }
        return res.status(500).render("homepage", {
            message: "Something went wrong, try again."
        });
    }
});

module.exports = router;