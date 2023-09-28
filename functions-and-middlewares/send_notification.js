const nodeMailer = require("nodemailer");
const STUDENT = require("../Models/student");
const CLASSROOM = require("../Models/classroom");
const emailAddress = require("../protected").emailAddress;
const password = require("../protected").password;

const transporter = nodeMailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: emailAddress,
        pass: password
    }
});

module.exports = async(classroomID, title, description) => {
    const students = await STUDENT.find();
    const classroom = await CLASSROOM.findOne({_id: classroomID});
    for(let i=0; i<students.length; i++) {
        if(students[i].classrooms.includes(classroomID)) {
            const mailOptions = {
                from: {
                    name: "Blue Fox Developers",
                    address: emailAddress
                },
                to: [students[i].email],
                subject: "New assignment posted",
                text: "Your faculty has posted a new assignment.",
                html: `<h1>Classroom name: ${classroom.name}</h1><h1>Title: ${title}</h1><p>Description: ${description}</p>`
            }
            try {
                transporter.sendMail(mailOptions);
            }
            catch(error) {
                console.log("Something went wrong.");
            }
        }
    }
    console.log("Notification sent to students about new assignment.");
}