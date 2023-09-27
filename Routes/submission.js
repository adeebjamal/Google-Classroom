const router = require("express").Router();
const jwt = require("jsonwebtoken");

// Importing user defined files and functions
const ASSIGNMENT = require("../Models/assignment");
const SUBMISSION = require("../Models/submission");
const STUDENT = require("../Models/student");
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
        const foundSubmission = await SUBMISSION.findOne({studentID: decodedJWT.ID});
        return res.status(200).json(foundSubmission);
    }
    catch(error) {
        console.log(error);
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
        return res.status(500).render("homepage", {
            message: "Something wrong happened, try again."
        });
    }
});

module.exports = router;