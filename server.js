const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// Importing user defined functions and files
const protected = require("./protected");

const app = express();

// Setting up MongoDB
mongoose.set("strictQuery",false);
mongoose.connect(protected.mongoDB_atlas_url);

// Middlewares
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.set("view engine","ejs");

// Adding routes
app.use("/", require("./Routes/index"));
app.use("/faculty", require("./Routes/faculty"));
app.use("/student", require("./Routes/student"));
app.use("/classroom", require("./Routes/classroom"));

app.listen(3000, () => {
    console.log("Server is running at port 3000. Go to http://localhost:3000");
});