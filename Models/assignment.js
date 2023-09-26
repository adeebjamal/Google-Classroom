const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    classroomID: {
        type: String,
        required: true
    },
    facultyID: {
        type: String,
        required: true
    }
});

module.exports = new mongoose.model("Assignment", assignmentSchema);