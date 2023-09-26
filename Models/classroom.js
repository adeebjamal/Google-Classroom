const mongoose = require("mongoose");

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    facultyID: {
        type: String,
        required: true
    }
});

module.exports = new mongoose.model("Classroom",classroomSchema);