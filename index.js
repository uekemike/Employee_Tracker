// Bring in any Libraries
const express = require('express');
const inquirer = require('inquirer');
const mysql2 = require('mysql2');
const console = require('console.table');

// Connect to  Database 
const db = mysql2.createConnection(
{
    host: 'localhost',
    user: 'root',
    password: 'test',
    database: 'employeetracker_db'
});

db.connect(function(error) {
    if(error) {
        throw error;
    }
    console.log('Database connected ...');
})


const employeeDetailsArray = ["View all departments", "View all roles", "View all employees", "Add a department", "Add an employee" ,"Update an employee role" ];

function init() {
    homePrompt();
  }
  // 
  function homePrompt() {
    inquirer.prompt([{
      type: "list",
      name: "showMainChoice",
      message: "What would like to do?",
      choices: employeeDetailsArray
          
    }
    ]).then((userChoice) => {
      switch (userChoice.showMainChoice) {
        case "View All Departments": viewAllDept();
          break;
        case "add an employee": addEmployee();
          break;
        case "update an employee role": updateEmpRole();
          break;
        case "View All Roles": viewAllRoles();
          break;
        case "add a role": addRole();
          break;
        case "View All Employees": viewAllEmployee();
          break;
        case "Add Department": addDept();
          break;
        case "Quit": db.end();
          break;
        default:
          console.log("something went wrong, Please Check your code");
          break;
  
      }
    })
  
  }
  // Function view Department
  function viewAllDept() {
    db.query(`SELECT * FROM department`, function (err, result) {
      if (err) {
        console.log(err);
      }
      console.table(result);
      homePrompt();
    });
  }
  
  
  //  Function view roles
  function viewAllRoles() {
    db.query(`SELECT A.id, A.title, A.salary, B.name AS Department, A.department_id
              FROM role AS A
              JOIN department as B
              ON A.department_id = B.id `, function (err, result) {
      if (err) {
        console.log(err);
      }
      console.table(result);
      homePrompt();
    });
  }
  
  // Function view employees
  function viewAllEmployee() {
    var sqlQuery = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r
      ON e.role_id = r.id
    LEFT JOIN department d
    ON d.id = r.department_id
    LEFT JOIN employee m
      ON m.id = e.manager_id` ;
  
    db.query(sqlQuery, function (err, res) {
      if (err) {
        console.log(err);
      }
      console.table(res);
      homePrompt();
    });
  }
  
  //Function add Department
  
  function addDept() {
    inquirer.prompt([{
      type: "input",
      name: "dept",
      message: "Enter the Name of the department? "
    }
    ]).then((answer) => {
      let deptName = answer.dept;
      console.log(deptName);
      db.query(`INSERT INTO department (name) VALUES ('${deptName}')`, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log("DEPARTMENT Added sucessfully!!");
        homePrompt();
      })
    })
  
  }
  
  
  // Function add a Role
  function addRole() {
    var query =
      `SELECT id , name FROM department`
    db.query(query, function (err, res) {
      if (err) {
        console.log('Error while fetching department data');
        return;
      }
      const empdept = [];
      for (let index = 0; index < res.length; index++) {
        empdept.push(res[index].name);
  
      }
      promptForAddingRole(empdept)
    })
  }
  function promptForAddingRole(empdept) {
    inquirer.prompt([
      {
        type: "input",
        name: "role",
        message: "Enter Name of the role?"
      },
      {
        type: "input",
        name: "salary",
        message: "Enter the salary :?"
      },
      {
        type: "list",
        name: "dept",
        message: "Enter Name department ?",
        choices: empdept,
      },
    ]).then((answer) => {
      let newRole = answer.role;
      let newSalary = answer.salary;
      let dept = answer.dept;
  
      db.query(`SELECT id FROM department WHERE name = ('${answer.dept}')`, (err, result) => {
        if (err) {
          console.log(err);
        }
        const deptid = result[0].id;
  
        db.query(`INSERT INTO role (title,salary,department_id) VALUES ('${newRole}', '${newSalary}','${deptid}')`, (err, result) => {
          if (err) {
            console.log(err);
          }
          console.log("ROW added sucessfully");
          homePrompt();
        })
      });
    })
  }
  
  //Function add an employee
  function addEmployee() {
  
    var query1 = `SELECT department_id , title FROM role`
    db.query(query1, function (err, res) {
      if (err) {
        console.log('Error while fetching role data');
        return;
      }
      var empRole = [];
      for (let index = 0; index < res.length; index++) {
        empRole.push(res[index].title);
      }
      var query2 = `SELECT  id , first_name, last_name FROM employee`
      db.query(query2, function (err, res) {
        if (err) {
          console.log('Error while fetching role data');
          return;
        }
        var empMngr = [];
        for (let index = 0; index < res.length; index++) {
          empMngr.push(res[index].first_name + ' ' + res[index].last_name);
        }
        promptForAddingEmployee(empRole, empMngr)
  
      });
    });
  }
  
  function promptForAddingEmployee(empRole, empMngr) {
    inquirer.prompt([
      {
        type: "input",
        name: "employeeFirstName",
        message: "What is employee's first Name?"
      },
      {
        type: "input",
        name: "employeeLastName",
        message: "What is employee's last Name?"
      },
      {
        type: "list",
        name: "employeeRole",
        message: "What is employee's role?",
        choices: empRole,
      },
      {
        type: "list",
        name: "employeeManager",
        message: "Who is employee's Manager?",
        choices: empMngr,
      },
  
    ]).then((answers) => {
  
      let newEmpFName = answers.employeeFirstName;
      let newEmpLName = answers.employeeLastName;
      db.query(`SELECT id FROM role WHERE title = ('${answers.employeeRole}')`, (err, res) => {
        if (err) {
          console.log(err);
        }
        var newEmpRole_id = res[0].id;
        db.query(`SELECT id FROM employee WHERE concat(first_name, " ", last_name) = ('${answers.employeeManager}')`, (err, result) => {
          if (err) {
            console.log(err);
          }
  
          var newMgrRole_id = result[0].id;
  
          db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${newEmpFName}', '${newEmpLName}', '${newEmpRole_id}', '${newMgrRole_id}')`, (err, result) => {
            if (err) {
              console.log(err);
            }
            console.log("ROW added sucessfully");
            homePrompt();
          })
        });
      });
  
    })
  
  }
  //Function update  role
  function updateEmpRole() {
  
    var query1 = `SELECT first_name, last_name FROM employee`
    db.query(query1, function (err, res) {
      if (err) {
        console.log('Error while fetching  data');
        return;
      }
      var empName = [];
      for (let index = 0; index < res.length; index++) {
        empName.push(res[index].first_name + " " + res[index].last_name);
      }
      var query2 = `SELECT title FROM role`
      db.query(query2, function (err, result) {
        if (err) {
          console.log('Error while fetching role data');
          return;
        }
        var empRole = [];
        for (let index = 0; index < result.length; index++) {
          empRole.push(result[index].title);
        }
        promptForUpdatingEmployeeRole(empName, empRole);
  
      })
  
    })
  
  }
  
  function promptForUpdatingEmployeeRole(empName, empRole) {
    inquirer.prompt([
      {
        type: "list",
        name: "employeeName",
        message: "Which employee do you want to change the role? ",
        choices: empName,
      },
      {
        type: "list",
        name: "employeeRole",
        message: "Select the new Role:  ",
        choices: empRole,
      }
    ]).then((answers) => {
      let employeeName = answers.employeeName;
      let employeeRole = answers.employeeRole;
      db.query(`SELECT id FROM role WHERE title = ("${answers.employeeRole}")`, (err, res) => {
        if (err) {
          console.log(err);
        }
        var newEmpRole_id = res[0].id;
        db.query(`SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) = ('${answers.employeeName}')`, (err, result) => {
          if (err) {
            console.log(err);
          }
  
          var empId = result[0].id;
  
  
          var query = `UPDATE employee SET role_id = ? WHERE id = ?`
          db.query(query, [newEmpRole_id, empId], (err, result) => {
            if (err) {
              console.log(err);
            }
            console.log("Updated the Information");
            homePrompt();
  
          })
  
        })
  
      })
  
    })
  
  }
  
  init();
  