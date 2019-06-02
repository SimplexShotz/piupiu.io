
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
  name: prompt("Enter a username."),
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  n: -1,
  saying: {
    countdown: 0,
    t: 0
  }
};

var chat = {
  open: false,
  t: ""
};

ref.n.once("value", function(data) {
  var d = data.val();
  p.n = d;
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

function updatePlayer() {
  if (p.n !== -1) {
    ref.p.child(p.name).set(p);
  }
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
}

var kp = [];
function keyTyped() {
  console.log(keyCode);
  if (chat.open && keyCode !== 8) {
    chat.t += key;
  }
}
function keyPressed() {
  kp[keyCode] = true;
  if (chat.open && keyCode === 8) {
    chat.t = chat.t.split("");
    chat.t.pop();
    chat.t = chat.t.join("");
  }
}
function keyReleased() {
  kp[keyCode] = false;
}

function draw() {
  updatePlayers();
  background(225);
  strokeWeight(5);
  for (var i in players) {
    if (players[i].n !== p.n) {
      stroke(50);
      fill(200, 50, 50);
      ellipse(players[i].x, players[i].y, 50, 50);
      noStroke();
      fill(0);
      textAlign(CENTER, BOTTOM);
      textSize(24);
      text(players[i].name, players[i].x, players[i].y - 32);
      textSize(16);
      textAlign(CENTER, TOP);
      text(players[i].saying.t, players[i].x, players[i].y + 32);
    }
  }
  stroke(50);
  fill(50, 200, 50);
  ellipse(p.x, p.y, 50, 50);
  noStroke();
  fill(0);
  textAlign(CENTER, BOTTOM);
  textSize(24);
  text(p.name, p.x, p.y - 32);
  textSize(16);
  textAlign(CENTER, TOP);
  text(p.saying.t, p.x, p.y + 32);
  if (p.saying.countdown <= 0) {
    p.saying.t = "";
  }
  if (kp[13]) {
    if (chat.open && chat.t !== "") {
      p.saying.countdown = 1000;
      p.saying.t = chat.t;
      chat.t = "";
    }
    chat.open = !chat.open;
    kp[13] = false;
  }
  if (chat.open) {
    noStroke();
    fill(0, 100);
    rect(p.x + 35, p.y - 30, 200, 60, 10);
    fill(255);
    textSize(20);
    textAlign(LEFT, CENTER);
    text(chat.t, p.x + 45, p.y);
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
  p.saying.countdown--;
  updatePlayer();
}, 1000 / 100);

function unload() {
  p.n = -1;
  ref.p.child(p.name).remove();
};
