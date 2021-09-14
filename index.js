// Bring in any Libraries
const inquirer = require('inquirer');
const mysql2 = require('mysql2');

// Connect to our Database 
const db = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "test",
    database: "employeetracker_db"
});

db.connect(function(error) {
    if(error) {
        throw error;
    }
    console.log("Database connected ...");
})


