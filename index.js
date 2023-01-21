const express = require("express");

const app = express();
const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "billeasy",
  password: "3105",
  dialect: "postgres",
  port: 5432,
});

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error("Error executing query", err.stack);
    }
    console.log("Connected to Database !");
  });
});

app.get("/select", (req, res, next) => {
  var query = "";
  if(req.query.table==null || req.query.table==undefined){
    query = "select * from employees;";
  }
  else{
    query = "select * from " + req.query.table + ";";
  }
  console.log("RESULT DATA :");
  pool.query(query).then((testData) => {
    console.log(testData.rows);
    res.send(testData.rows);
  }).catch((e)=>{
    res.send("Only 'employees' and 'departments' table exists.")
  })
});

app.get("/selectEmp", (req, res, next) => {
  console.log("RESULT DATA :");
  pool.query("Select * from employees;").then((testData) => {
    console.log(testData.rows);
    res.send(testData.rows);
  });
});

app.get("/showJoin", (req, res, next) => {
  pool
    .query(
      "Select EMP.id,EMP.name,EMP.department_id,DEPT.name as Dept_name,EMP.salary,EMP.date_join from employees as EMP INNER JOIN departments as DEPT ON EMP.department_id=DEPT.id order by DEPT.id;"
    )
    .then((testData) => {
      res.send(testData.rows);
    });
});
// 101 - Technical, 102 - Sales,103 - HR
app.get("/insertDept", (req, res, next) => {
  var query = "INSERT INTO departments (id,name,employee_count) VALUES ("+ parseInt(req.query.id) + "," + "'" +req.query.dept_name + "'"  + "," + parseInt(req.query.emp_count) + ")";
  pool
    .query(
      query
    )
    .then((testData) => {
      console.log(testData);
      res.send("All departments for billeasy are created! Check by running the select query :) 😊");
    })
    .catch((e) => {
      res.send(
        "Kindly pass the parameters correctly to add a new department in departments table"
      );
    });
});

app.get("/insertEmp", (req, res, next) => {
  console.log(typeof(req.query.name));
  console.log(typeof(req.query.date));
  console.log(typeof(parseInt(req.query.id)));
  var query = "INSERT INTO employees (id,name,department_id,salary,date_join) VALUES ("+ parseInt(req.query.id) + "," +"'" +req.query.name + "'" +"," + parseInt(req.query.dept_id) + "," + parseInt(req.query.salary) + "," + "'" +req.query.date + "'"  + ")";
  pool
    .query(
      query
    )
    .then((testData) => {
      res.send(
        "New employee data added! Check by running the select query :) 😊"
      );
    })
    .catch((e) => {
      res.send(
        "Value already inserted according to primary key. or Invalid paramters,check the description and try again! Run select query if needed to check results"

      );
    });
});

app.get("/addTrigger", (req, res, next) => {
  pool
    .query(
      "CREATE OR REPLACE FUNCTION updateEmployeeCount() RETURNS TRIGGER AS $$ BEGIN UPDATE departments SET employee_count = employee_count + 1 WHERE id = NEW.department_id; RETURN NEW; END; $$ LANGUAGE plpgsql; CREATE TRIGGER updateEmployeeCountTrigger AFTER INSERT ON employees FOR EACH ROW EXECUTE PROCEDURE updateEmployeeCount();"
    )
    .then((testData) => {
      res.send("Output: Trigger Added!");
    })
    .catch((e) => {
      console.log("Trigger Updated");
    });
});

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
});
