const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rootroot',
  database: 'warehouseInventory'
});

connection.connect(function (err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server.');
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname, './public/login.html'));
});

app.get('/home', function (request, response) {
  response.sendFile(path.join(__dirname, './public/inventorySelection.html'))
})

app.post('/auth', function (request, response) {
  const username = request.body.username;
  const password = request.body.password;
  if (username && password) {
    connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
      if (results.length > 0) {
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect('/home');
      } else {
        response.send('Incorrect Username and/or Password!');
      }
      response.end();
    });
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});

app.get('/home', function (request, response) {
  if (request.session.loggedin) {
    response.send('Welcome back, ' + request.session.username + '!');
  } else {
    response.send('Please login to view this page!'); 
  }
  response.end();
});

app.get('/inventory', function (request, response) {
  connection.query('SELECT * from inventory')
})

app.post('/inventoryManagement' , function (request, response) {
  const itemID = request.body.itemID
  const itemName = request.body.itemName
  const itemType = request.body.itemType
  const itemCondition = request.body.itemCondition

  connection.query("INSERT INTO inventory (itemType) VALUES (?)", [itemType], function(err, result) {
    if(err) throw err;
      console.log("1 record inserted");
  });
  response.send(itemType);
});
// app.post('/inventorySelection', function (request, response) {
//   const itemID = request.body.itemID
//   const itemName = request.body.itemName
//   const itemType = request.body.itemType
//   const itemCondition = request.body.itemCondition
//   if (itemID && itemName && itemType && itemCondition) {
//     connection.query('SELECT * from inventory where itemID = ? and itemName = ? and itemType = ? and itemCondition = ?', [itemID, itemName, itemType, itemCondition], function (error,results, fields) {
      
//     })
//   }
// })
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));

