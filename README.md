# Google-Classroom-Clone
The `Google Classroom Clone` project is a robust web application designed for educational institutions, enabling seamless communication and collaboration between faculty and students. Key features include secure user authentication, classroom creation and management, assignment posting and submission, real-time notifications, and detailed evaluation tools. Through intuitive interfaces for both faculty and students, the platform streamlines the learning process, fostering efficient assignment management and enhancing overall educational experiences.


## `server.js` file in `/` folder
The `server.js` file serves as the central hub of the web application, responsible for handling incoming requests, managing the application's routes, and connecting to the database.

* Express setup<br>
`express`: Initializes the Express.js application.<br>
`ejs`: Template engine for rendering dynamic content.<br>
`mongoose`: MongoDB object modeling tool for Node.js.<br>
`cookieParser`: Middleware for handling cookies.<br>

* Database Connection<br>
`mongoose.set("strictQuery",false)`: Configures MongoDB to allow flexible querying.<br>
`mongoose.connect(protected.mongoDB_atlas_url)`: Establishes a connection to the MongoDB Atlas database using a secure URL from the protected module.<br>

* Middlewares<br>
`express.urlencoded({extended: true})`: Parses incoming request bodies, allowing access to form data.<br>
`express.json()`: Parses incoming JSON requests.<br>
`cookieParser()`: Parses cookies attached to the incoming requests.<br>
`app.set("view engine","ejs")`: Sets EJS as the view engine, enabling dynamic HTML rendering.<br>

* Routes<br>
`app.use("/", require("./Routes/index"))`: Handles root-level requests using the routes defined in index.js.<br>
`app.use("/faculty", require("./Routes/faculty"))`: Handles requests related to faculty functionality.
`app.use("/student", require("./Routes/student"))`: Handles requests related to student functionality.
`app.use("/classroom", require("./Routes/classroom"))`: Handles requests related to classroom functionality.
`app.use("/assignment", require("./Routes/assignment"))`: Handles requests related to assignment functionality.
`app.use("/submission", require("./Routes/submission"))`: Handles requests related to assignment submissions.


## `protected.js` file in `/` folder
The `protected.js` file serves as a secure configuration file, storing sensitive information such as database URLs, secret keys, and email credentials. It enhances the security of the application by keeping this sensitive data separate from the main codebase.


## `Models` folder
The `Models` folder in your project plays a vital role in implementing the data schema and modeling the data structure for the MongoDB database. Each JavaScript file inside the `Models` folder represents a specific data entity in your application.

### 1. `assignment.js`:
* Defines the schema for assignments, including properties like `title`, `description`, `classroomID`, and `facultyID`.
* This schema represents the structure of assignment documents stored in the MongoDB database.

### 2. `classroom.js`:
* Represents the schema for classrooms, containing attributes such as `name`, `description`, and `facultyID`.
* Describes how classroom data is organized, ensuring consistency and structure when storing classroom information.

### 3. `faculty.js`:
* Defines the schema for faculty members, specifying properties like `name`, `email`, and `password`.
* This schema models the data for faculty members, allowing the application to store and manage faculty-related information.

### 4. `student.js`:
* Represents the schema for students, including fields such as `name`, `email`, `password`, and `classrooms`.
* Describes the structure of student data, enabling the application to handle student-related information in a standardized way.

### 5. `submission.js`:
* Defines the schema for submissions, containing attributes like `assignmentID`, `studentID`, `link`, and `marks`.
* This schema outlines the structure of submission data, allowing the application to store information related to assignments submitted by students.


## `functions-and-middlewares` folder

### 1. `OTPgenerator.js`:
The `OTPGenerator.js` file exports a function that generates a random 6-digit number (OTP stands for One-Time Password). 

### 2. `send_otp.js`:
The `send_otp.js` file exports a function named sendOTP which is responsible for sending a verification email containing a generated OTP (One-Time Password) to a specified email address.

**Nodemailer Configuration:**
* The file imports the `nodemailer` module and email credentials (email address and password) from a `protected.js` file.
* It sets up the Nodemailer transporter with Gmail SMTP settings, enabling it to send emails via Gmail's servers.

**Email Composition:**

* The `sendOTP` function takes two parameters: `email` (recipient's email address) and `OTP` (the generated One-Time Password).
* It constructs an email message (`mailOptions`) including the sender's name, recipient's email, subject, plain text content, and HTML content.
* The OTP is embedded in the HTML part of the email, ensuring it's clearly visible to the recipient.

**Sending the Email:**
* The function attempts to send the email using the configured transporter.
* If the email is successfully sent, it logs "Email sent." to the console.
* If there's an error during the email sending process, it logs "Something went wrong."

### 3. `send_notification.js`:
The `send_notification.js` file is similar to the `send_otp.js` file. The only difference is that it sends a _notification_ to students as soon as some new assignment is posted in the classroom.


## `Routes` folder


### 1. `index.js`:
The `index.js` file exports an Express.js router that handles the main route of your application. Here's how it works briefly:

**Root Route (`/`):**
* Checks if there's a student JWT token. If yes, decodes it to find the student's ID, retrieves their information, and their associated classrooms.
* Checks if there's a faculty JWT token. If yes, decodes it to find the faculty's ID, retrieves their information, and their created classrooms.
* Renders the student dashboard if a student is logged in, faculty dashboard if a faculty member is logged in, or the homepage if no one is logged in.
* Handles errors and clears cookies if necessary.


### 2. `faculty.js`:
The `faculty.js` file exports an Express.js router that handles various faculty-related operations for your application. Here's how it works briefly:

**Logout Route (`/logout`):**
* Clears the faculty's JWT token, effectively logging them out.
* Renders the homepage with a "Logout successful" message.

**Registration Route (`/register`):**
* Validates user input for registration, including checking password strength and matching.
* Generates an OTP (One-Time Password) and encodes user details and OTP in a JWT.
* Sends the OTP to the user's email using the `send_OTP` function.
* Renders a page for OTP verification.

**OTP Verification Route (`/OTP`):**
* Verifies the received OTP from the user against the stored OTP in the JWT.
* If OTP matches, creates a new faculty user with hashed password and saves it to the database.
* Clears the OTP JWT cookie and renders the homepage with a registration success message.

**Login Route (`/login`):**
* Validates user input for login, checking if the email exists and if the password matches.
* Issues a JWT token upon successful login.
* Redirects the faculty to their dashboard with available classrooms upon successful login.

**Classroom Creation Route (`/classroom`):**
* Validates input, checks faculty authentication, and creates a new classroom associated with the faculty.
* Renders the faculty dashboard with a success message and updated classroom list.


### 3. `student.js`:
The `student.js` file exports an Express.js router that handles various student-related operations for your application. Here's how it works briefly:

**Logout Route (`/logout`):**
* Clears the student's JWT token, effectively logging them out.
* Renders the homepage with a "Logout successful" message.

**Registration Route (`/register`):**
* Validates user input for registration, including checking password strength and matching.
* Generates an OTP (One-Time Password) and encodes user details and OTP in a JWT.
* Sends the OTP to the user's email using the `send_OTP` function.
* Renders a page for OTP verification.

**OTP Verification Route (`/OTP`):**
* Verifies the received OTP from the user against the stored OTP in the JWT.
* If OTP matches, creates a new student user with hashed password and saves it to the database.
* Clears the OTP JWT cookie and renders the homepage with a registration success message.

**Login Route (`/login`):**
* Validates user input for login, checking if the email exists and if the password matches.
* Issues a JWT token upon successful login.
* Redirects the student to their dashboard with available classrooms upon successful login.


### 4. `classroom.js`:
The `classroom.js` file exports an Express.js router that handles various routes related to classrooms. Here's how it works briefly:

**Faculty Classroom Route (`/faculty/:classroomID`):**
* Checks if the faculty is logged in using the JWT token.
* Verifies if the faculty has the authorization for the specified classroom.
* Retrieves assignments related to the classroom and renders the faculty's classroom view.
* Handles errors and redirects to the homepage if necessary.

**Student Classroom Route (`/student/:classroomID`):**
* Checks if the student is logged in using the JWT token.
* Verifies if the student is enrolled in the specified classroom.
* If enrolled, retrieves assignments related to the classroom and renders the student's classroom view.
* If not enrolled, redirects to the student dashboard.
* Handles errors and redirects to the homepage if necessary.

**Join Classroom Route (`/join` - POST):**
* Checks if the student is logged in using the JWT token.
* Adds the specified classroom to the student's enrolled classrooms.
* Renders the student dashboard with a success message.
* Handles errors and redirects to the homepage if necessary.


### 5. `assignment.js`:
The `assignment.js` file exports an Express.js router that handles the creation of assignments for a specific classroom. Here's how it works briefly:

**Create Assignment Route (`/:classroomID` - POST):**
* Checks if the faculty is logged in using the JWT token.
* Verifies if the faculty has the authorization for the specified classroom.
* Creates a new assignment instance with the provided title, description, classroom ID, and faculty ID.
* Saves the assignment to the database.
* Sends a notification about the new assignment to the classroom.
* Retrieves all assignments related to the classroom and renders the faculty's classroom view with a success message.
* Handles errors and redirects to the homepage if necessary.


### 6. `submission.js`:
The `submission.js` file exports an Express.js router that handles submissions for assignments. Here's how it works briefly:

**View Student's Submissions (`/:assignmentID` - GET):**
* Verifies the student's JWT token.
* Retrieves the submissions related to the specified assignment made by the logged-in student.
* Renders a page displaying the student's submissions for the assignment.

**View All Submissions (`/viewAll/:assignmentID` - GET):**
* Verifies the faculty's JWT token.
* Retrieves all submissions related to the specified assignment.
* Renders a page displaying all submissions for the assignment.

**Submit Assignment (`/:assignmentID` - POST):**
* Verifies the student's JWT token.
* Checks if the student is authorized to submit the assignment by verifying their enrollment in the corresponding classroom.
* Creates a new submission instance with the provided assignment ID, student ID, submission link, and default "Not evaluated yet." marks.
* Saves the submission to the database.
* Redirects the student to the classroom view related to the submitted assignment.

**Evaluate Submission (`/evaluate/:submissionID` - POST):**
* Verifies the faculty's JWT token.
* Retrieves the specified submission.
* Retrieves the related assignment and classroom.
* Checks if the faculty is authorized to evaluate submissions for the assignment.
* Updates the submission's marks based on the input received.
* Redirects the faculty to view all submissions for the evaluated assignment.
