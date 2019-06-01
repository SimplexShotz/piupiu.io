
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDpuv9Cct6f-UDYFsRJUJRrHa5Sf8WoLxA",
  authDomain: "piupiu-io.firebaseapp.com",
  databaseURL: "https://piupiu-io.firebaseio.com",
  projectId: "piupiu-io",
  storageBucket: "piupiu-io.appspot.com",
  messagingSenderId: "605234201825",
  appId: "1:605234201825:web:8d4aab7363ebf227"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var ref = {
  n: database.ref("n"), // unique number is given to each player
  p: database.ref("p")
};

var players = [];
var p = {
  name: "user",
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  n: -1
};

ref.n.once("value", function(data) {
  var d = data.val();
  p.n = d;
  p.name = "user" + d;
  ref.n.set(d + 1);
});

function updatePlayers() {
  ref.p.once("value", function(data) {
    players = [];
    var d = data.val();
    for (var i in d) {
      players[d[i].n] = d[i];
    }
  });
}
updatePlayers();

function sendLocation() {
  if (p.n !== -1) {
    ref.p.child(p.name).set(p);
  }
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
}

var kp = [];
function keyPressed() {
  kp[keyCode] = true;
}
function keyReleased() {
  kp[keyCode] = false;
}

function draw() {
  updatePlayers();
  background(255);
  stroke(0);
  strokeWeight(5);
  for (var i in players) {
    fill(200, 50, 50);
    if (players[i].n === p.n) {
      fill(50, 200, 50);
    }
    ellipse(players[i].x, players[i].y, 50, 50);
  }
}

setInterval(function() {
  if (kp[37]) {
    p.x -= 3;
  }
  if (kp[38]) {
    p.y -= 3;
  }
  if (kp[39]) {
    p.x += 3;
  }
  if (kp[40]) {
    p.y += 3;
  }
  sendLocation();
}, 1000 / 100);

function unload() {
  p.n = -1;
  ref.p.child(p.name).remove();
};
