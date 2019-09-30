var http = require("http");
var path = require("path");
var mysql = require("mysql");
var session = require("express-session");
var bodyParser = require("body-parser");

var async = require("async");
var socketio = require("socket.io");
var express = require("express");

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

app.use(express.static(path.resolve(__dirname, "client")));
/*******************************************
 LOGIN
 ********************************************/
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodelogin"
});

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/auth", function(request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
    connection.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password],
      function(error, results, fields) {
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect("/chat.html");
        response.json({ msg: "instructions" });
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});

app.get("/chat", function(request, response) {
  if (request.session.loggedin) {
    response.send("Welcome back, " + request.session.username + "!");
    // document.querySelector("#username").value = request.session.username;
    response.render("/chat");
  } else {
    response.send("Please login to view this page!");
  }
  response.end();
});

/************************** */
var messages = [];
var sockets = [];

io.on("connection", function(socket) {
  messages.forEach(function(data) {
    socket.emit("message", data);
  });

  sockets.push(socket);

  socket.on("disconnect", function() {
    sockets.splice(sockets.indexOf(socket), 1);
    updateRoster();
  });

  socket.on("message", function(msg) {
    var text = String(msg || "");

    if (!text) return;

    socket.get("name", function(err, name) {
      var data = {
        name: name,
        text: text
      };

      broadcast("message", data);
      messages.push(data);
    });
  });

  socket.on("identify", function(name) {
    socket.set("name", String(name || "Anonymous"), function(err) {
      updateRoster();
    });
  });
});

function updateRoster() {
  async.map(
    sockets,
    function(socket, callback) {
      socket.get("name", callback);
    },
    function(err, names) {
      broadcast("roster", names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function(socket) {
    socket.emit(event, data);
  });
}

server.listen(
  process.env.PORT || 3000,
  process.env.IP || "0.0.0.0",
  function() {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
  }
);
