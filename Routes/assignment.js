const router = require("express").Router();
const jwt = require("jsonwebtoken");

// Importing user defined files and functions
const protected = require("../protected");
const CLASSROOM = require("../Models/classroom");
const ASSIGNMENT = require("../Models/assignment");

// ---------- POST routes ----------
router.post("/:classroomID", async(req,res) => {
    try {
        const receivedToken = req.cookies.JWT_token_faculty;
        if(!receivedToken) {
            return res.status(400).render("homepage", {
                message: "You need to login first."
            });
        }
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        const foundClassroom = await CLASSROOM.findOne({_id: req.params.classroomID});
        if(foundClassroom.facultyID !== decodedJWT.ID) {
            return res.status(400).render("homepage", {
                message: "You are not authorized. Login first."
            });
        }
        const createdAssignment = new ASSIGNMENT({
            title: req.body.assignmentTitle,
            description: req.body.assignmentDescription,
            classroomID: foundClassroom._id,
            facultyID: decodedJWT.ID
        });
        await createdAssignment.save();
        const foundAssignments = await ASSIGNMENT.find({classroomID: foundClassroom._id});
        return res.status(201).render("classroom-faculty", {
            classroom: foundClassroom,
            assignments: foundAssignments,
            message: "Assignment posted successfully."
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