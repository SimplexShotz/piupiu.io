
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
  name: prompt("Enter a username.").split(".").join("․").split("#").join("").split("$").join("").split("[").join("(").split("]").join(")").split("").splice(0, 16).join("") || "piupiu-io",
  x: (Math.random() - 0.5) * 2 * 5000,
  y: (Math.random() - 0.5) * 2 * 5000,
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
    ref.p.child(p.name + ":" + p.n).set(p);
  }
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  angleMode(DEGREES);
}

function rot(x1, y1, x2, y2) {
    if (x1 - x2 === 0) {
        return (y2 >= y1 ? 90 : 270);
    }
    if (x2 - x1 > 0 && y2 - y1 < 0) {
        return atan((y1 - y2) / (x1 - x2)) + 360;
    }
    return atan((y1 - y2) / (x1 - x2)) + (x1 >= x2 ? 180 : 0);
}

var kp = [];
function keyTyped() {
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

function miniMap(x, y, w, h) {
  fill(0, 150);
  rect(x, y, w, h);
  fill(255, 100);
  for (var i in players) {
    if (players[i].n !== p.n) {
      ellipse(x + w / 2 + players[i].x / 5000 * w / 2, y + h / 2 + players[i].y / 5000 * h / 2, 5, 5);
    }
  }
  fill(255, 200);
  ellipse(x + w / 2 + p.x / 5000 * w / 2, y + h / 2 + p.y / 5000 * h / 2, 5, 5);
}

var ox, oy, l, infot;
function draw() {
  ox = window.innerWidth / 2 - p.x;
  oy = window.innerHeight / 2 - p.y;
  updatePlayers();
  background(100);
  fill(225);
  rect(-5000 + ox, -5000 + oy, 10000, 10000);
  noStroke();
  l = 0;
  for (var i in players) {
    l++;
  }
  infot = "V 0.1.2 - Alpha\n(" + l + " online)";
  fill(0, 150);
  rect(20, 20, textWidth(infot) + 40, 64, 5);
  fill(255, 200);
  textAlign(LEFT, TOP);
  textSize(12);
  text(infot, 40, 40);
  strokeWeight(5);
  for (var i in players) {
    if (players[i].n !== p.n) {
      stroke(50);
      fill(200, 50, 50);
      ellipse(players[i].x + ox, players[i].y + oy, 50, 50);
      noStroke();
      fill(0);
      textAlign(CENTER, BOTTOM);
      textSize(24);
      text(players[i].name, players[i].x + ox, players[i].y + oy - 32);
      textSize(16);
      textAlign(CENTER, TOP);
      text(players[i].saying.t, players[i].x + ox, players[i].y + oy + 32);
    }
  }
  stroke(50);
  fill(50, 200, 50);
  ellipse(window.innerWidth / 2, window.innerHeight / 2, 50, 50);
  noStroke();
  fill(0);
  textAlign(CENTER, BOTTOM);
  textSize(24);
  text(p.name, window.innerWidth / 2, window.innerHeight / 2 - 32);
  textSize(16);
  textAlign(CENTER, TOP);
  text(p.saying.t, window.innerWidth / 2, window.innerHeight / 2 + 32);
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
    rect(window.innerWidth / 2 + 35, window.innerHeight / 2 - 30, 200, 60, 10);
    fill(255);
    textSize(20);
    textAlign(LEFT, CENTER);
    text(chat.t, window.innerWidth / 2 + 45, window.innerHeight / 2);
  }
  miniMap(window.innerWidth - 120, window.innerHeight - 120, 100, 100);
}

var off, m;
setInterval(function() {
  off = rot(window.innerWidth / 2, window.innerHeight / 2, mouseX, mouseY);
  m = min(dist(window.innerWidth / 2, window.innerHeight / 2, mouseX, mouseY) / min(window.innerHeight / 4, window.innerWidth / 4), 1);
  if (m <= 0.05) {
    m = 0;
  }
  p.x += cos(off) * m * 20;
  p.y += sin(off) * m * 20;
  if (p.x < -5000) {
    p.x = -5000;
  }
  if (p.x > 5000) {
    p.x = 5000;
  }
  if (p.y < -5000) {
    p.y = -5000;
  }
  if (p.y > 5000) {
    p.y = 5000;
  }
  if (p.saying.countdown > 0) {
    p.saying.countdown--;
  }
  updatePlayer();
}, 1000 / 50);

function unload() {
  ref.p.child(p.name + ":" + p.n).remove();
  p.n = -1;
};
