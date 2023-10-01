const router = require("express").Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Importing user defined files and functions
const CLASSROOM = require("../Models/classroom");
const STUDENT = require("../Models/student");
const ASSIGNMENT = require("../Models/assignment");
const protected = require("../protected");

// ---------- GET routes ----------
router.get("/faculty/:classroomID", async(req,res) => {
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
            res.clearCookie("JWT_token_faculty");
            return res.status(400).render("homepage", {
                message: "You are not authorized. Login again."
            });
        }
        const foundAssignments = await ASSIGNMENT.find({classroomID: req.params.classroomID});
        return res.status(200).render("classroom-faculty", {
            classroom: foundClassroom,
            message: "",
            assignments: foundAssignments
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

router.get("/student/:classroomID", async(req,res) => {
    try {
        const receivedToken = req.cookies.JWT_token_student;
        if(!receivedToken) {
            return res.status(400).render("homepage", {
                message: "You need to login first."
            });
        }
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        const foundStudent = await STUDENT.findOne({_id: decodedJWT.ID});
        if(foundStudent.classrooms.includes(req.params.classroomID)) {
            const foundClassroom = await CLASSROOM.findOne({_id: req.params.classroomID});
            const foundAssignments = await ASSIGNMENT.find({classroomID: req.params.classroomID});
            return res.status(200).render("classroom-student", {
                classroom: foundClassroom,
                assignments: foundAssignments
            });
        }
        else {
            const foundClassrooms = await CLASSROOM.find({_id: {$in: foundStudent.classrooms}});
            return res.status(400).render("student-dashboard", {
                name: foundStudent.name,
                classrooms: foundClassrooms
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
        return res.status(500).render("homapage", {
            message: "Something went wrong, try again."
        });
    }
});

// ---------- POST routes ----------
router.post("/join", async(req,res) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.body.classroomID)) {
            return res.status(400).json({
                message: `Bad request. Classroom with ID: ${req.body.classroomID} doesn't exists.`
            });
        }
        const foundClass = await CLASSROOM.findOne({_id: req.body.classroomID});
        if(!foundClass) {
            return res.status(400).json({
                message: `Bad request. Classroom with ID: ${req.body.classroomID} doesn't exists.`
            });
        }
        const receivedToken = req.cookies.JWT_token_student;
        if(!receivedToken) {
            return res.status(400).render("homepage", {
                message: "You need to login first."
            });
        }
        const decodedJWT = jwt.verify(receivedToken, protected.SECRET_KEY);
        const foundStudent = await STUDENT.findOne({_id: decodedJWT.ID});
        if(foundStudent.classrooms.includes(req.body.classroomID)) {
            return res.status(400).json({
                message: `Bad request. You've already joined this classroom.`
            });
        }
        foundStudent.classrooms.push(req.body.classroomID);
        await foundStudent.save();
        const foundClassrooms = await CLASSROOM.find({_id: {$in: foundStudent.classrooms}});
        return res.status(200).render("student-dashboard", {
            name: foundStudent.name,
            classrooms: foundClassrooms,
            message: "Classroom joint successfully."
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