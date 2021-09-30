  
INSERT INTO department (name)
VALUES ("Human Resource"),
        ("Development"),
        ("Account"),
        ("QA");
      


INSERT INTO role (title,salary,department_id)
VALUES ("HR Manager", 170000, 1),
        ("Software Developer", 130000, 2),
        ("QA Engineer", 100000, 3),
        ("Lead Software Developer", 150000, 2),
        ("QA Lead", 110000, 3);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Mary","Ann", 3, null),
        ("Febi","Davis", 5, 1),
        ("Damon","Johnson", 1, 2),
        ("Hemant","Bharath", 4, 3),
        ("Syed","Syed", 2, null);