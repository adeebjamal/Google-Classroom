const router = require("express").Router();
const jwt = require("jsonwebtoken");

// Importing user defined files and functions
const ASSIGNMENT = require("../Models/assignment");
const SUBMISSION = require("../Models/submission");
const STUDENT = require("../Models/student");
const CLASSROOM = require("../Models/classroom");
const protected = require("../protected");

// ---------- GET routes ----------
router.get("/:assignmentID", async(req,res) => {
    try {
        const receivedToken = req.cookies.JWT_token_student;
        if(!receivedToken) {
            return res.status(400).render("homepage", {
                message: "You need to login first."
            });
        }
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        const foundSubmissions = await SUBMISSION.find({studentID: decodedJWT.ID, assignmentID: req.params.assignmentID});
        return res.status(200).render("check-marks", {
            submissions: foundSubmissions
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

router.get("/viewAll/:assignmentID", async(req,res) => {
    try {
        const receivedToken = req.cookies.JWT_token_faculty;
        if(!receivedToken) {
            return res.status(400).render("homepage", {
                message: "You need to login first."
            });
        }
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        const foundAssignment = await ASSIGNMENT.findOne({_id: req.params.assignmentID});
        if(foundAssignment.facultyID !== decodedJWT.ID) {
            return res.status(400).render("homepage", {
                message: "You are not authorized. Try logging in."
            });
        }
        const foundSubmissions = await SUBMISSION.find({assignmentID: req.params.assignmentID});
        return res.status(200).render("submissions", {
            assignment: foundAssignment,
            submissions: foundSubmissions
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

// ---------- POST routes ----------
router.post("/:assignmentID", async(req,res) => {
    try {
        const receivedToken = req.cookies.JWT_token_student;
        if(!receivedToken) {
            return res.status(400).render("homepage", {
                message: "You need to login first."
            });
        }
        const foundAssignment = await ASSIGNMENT.findOne({_id: req.params.assignmentID});
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        const foundStudent = await STUDENT.findOne({_id: decodedJWT.ID});
        if(foundStudent.classrooms.includes(foundAssignment.classroomID)) {
            const createdSubmission = new SUBMISSION({
                assignmentID: req.params.assignmentID,
                studentID: decodedJWT.ID,
                link: req.body.submissionLink,
                marks: "Not evaluated yet."
            });
            await createdSubmission.save();
            res.status(200).redirect("/classroom/student/"+foundAssignment.classroomID);
        }
        else {
            res.clearCookie("JWT_token_student");
            return res.status(400).render("homepage", {
                message: "You are not authorized. Login first."
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
            message: "Something wrong happened, try again."
        });
    }
});

router.post("/evaluate/:submissionID", async(req,res) => {
    try {
        const receivedToken = req.cookies.JWT_token_faculty;
        if(!receivedToken) {
            return res.status(400).render("homepage", {
                message: "You need to login first."
            });
        }
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        const foundSubmission = await SUBMISSION.findOne({_id: req.params.submissionID});
        const foundAssignment  = await ASSIGNMENT.findOne({_id: foundSubmission.assignmentID});
        const foundClassroom = await CLASSROOM.findOne({_id: foundAssignment.classroomID});
        if(foundClassroom.facultyID !== decodedJWT.ID) {
            return res.status(400).render("homepage", {
                message: "You are not authorized. Try logging in."
            });
        }
        foundSubmission.marks = req.body.marks;
        await foundSubmission.save();
        res.status(200).redirect("/submission/viewAll/"+foundAssignment._id);
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