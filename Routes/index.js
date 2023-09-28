const router = require("express").Router();
const jwt = require("jsonwebtoken");

// Importing user defined files and functions.
const protected = require("../protected");
const STUDENT = require("../Models/student");
const FACULTY = require("../Models/faculty");
const CLASSROOM = require("../Models/classroom");

router.get("/", async(req,res) => {
    try {
        if(req.cookies.JWT_token_student) {
            const decodedJWT = jwt.verify(req.cookies.JWT_token_student, protected.SECRET_KEY);
            const foundStudent = await STUDENT.findOne({_id: decodedJWT.ID});
            const foundClassrooms = await CLASSROOM.find({_id: {$in: foundStudent.classrooms}});
            return res.status(200).render("student-dashboard", {
                name: foundStudent.name,
                classrooms: foundClassrooms,
                message: ""
            });
        }
        else if(req.cookies.JWT_token_faculty) {
            const decodedJWT = jwt.verify(req.cookies.JWT_token_faculty, protected.SECRET_KEY);
            const foundFaculty = await FACULTY.findOne({_id: decodedJWT.ID});
            const facultyClassrooms = await CLASSROOM.find({facultyID: decodedJWT.ID});
            return res.status(200).render("faculty-dashboard", {
                name: foundFaculty.name,
                message: "",
                classrooms: facultyClassrooms
            });
        }
        return res.status(200).render("homepage", {
            message: ""
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