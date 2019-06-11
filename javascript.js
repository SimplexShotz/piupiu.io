
var ver = "V 0.4.1e3 - Alpha";

// Firebase config.
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
  p: database.ref("p"),
  hit: database.ref("hit")
};

var players = [];
var p = {
  n: -1
};

var last = {
  x: 0,
  y: 0
};

var chat = {
  open: false,
  t: ""
};

var alerts = [];

// important (red), warn (yellow-orange), info (light-blue)
function alrt(type, txt) {
  // add to alerts  here - [TODO]
  var alt = "<div class=\"alert-" + type + "\"><div class=\"icon\">" + (type === "info" ? "i" : "!") + "</div>" + txt + "</div>";
  document.getElementById("alert-container").innerHTML += alt;
}

function join_game() {
  p = {
    name: document.getElementById("name-input").value.split(".").join("․").split("#").join("").split("$").join("").split("[").join("(").split("]").join(")").split("").splice(0, 16).join("") || "piupiu․io",
    x: (Math.random() - 0.5) * 2 * 5000,
    y: (Math.random() - 0.5) * 2 * 5000,
    n: -1,
    health: 100,
    saying: {
      countdown: 0,
      t: 0
    },
    shooting: {
      bullets: [],
      countdown: 0
    },
    placed: {
      turrets: []
    },
    hit_immunity: 200
  };
  ref.n.once("value", function(data) {
    var d = data.val();
    p.n = d;
    ref.hit.child(p.name + ":" + d).set({
      state: false,
      by: ""
    });
    ref.n.set(d + 1);
  });
  updatePlayers();
  document.getElementById("name-container").style.display = "none";
}

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

var by;
function checkHit() {
  ref.hit.once("value", function(data) {
    var d = data.val();
    if (d && d[p.name + ":" + p.n] && d[p.name + ":" + p.n].state) {
      by = d[p.name + ":" + p.n].by;
      ref.hit.child(p.name + ":" + p.n).set({
        state: false,
        by: ""
      });
      if (p.hit_immunity <= 0) {
        p.hit_immunity = 15;
        p.health -= 10;
        if (p.health <= 0) {
          unload();
          alrt("important", "Killed by " + by + ".");
          document.getElementById("name-container").style.display = "block";
        }
      }
    }
  });
}

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

var mc = false;
var kp = [];
function keyTyped() {
  if (chat.open && keyCode !== 8) {
    chat.t += key;
  }
}
function keyPressed() {
  kp[keyCode] = true;
  if (p.n !== -1 && chat.open && keyCode === 8) {
    chat.t = chat.t.split("");
    chat.t.pop();
    chat.t = chat.t.join("");
  }
}
function keyReleased() {
  kp[keyCode] = false;
}
function mousePressed() {
  mc = true;
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
  if (p.n !== -1) {
    fill(255, 200);
    ellipse(x + w / 2 + p.x / 5000 * w / 2, y + h / 2 + p.y / 5000 * h / 2, 5, 5);
  }
}

var ox, oy, l, infot, cur;
function draw() {
  if (p.n !== -1) {
    last.x = p.x;
    last.y = p.y;
    p.hit_immunity--;
    ox = window.innerWidth / 2 - p.x;
    oy = window.innerHeight / 2 - p.y;
  } else {
    ox = window.innerWidth / 2 - last.x;
    oy = window.innerHeight / 2 - last.y;
  }
  updatePlayers();
  if (p.n !== -1) {
    checkHit();
  }
  background(100);
  fill(225);
  rect(-5000 + ox, -5000 + oy, 10000, 10000);
  noStroke();
  l = 0;
  for (var i in players) {
    l++;
  }
  textAlign(LEFT, TOP);
  textSize(12);
  infot = ver + "\n(" + l + " online)";
  fill(0, 150);
  rect(20, 20, textWidth(infot) + 40, 64, 5);
  fill(255, 200);
  text(infot, 40, 40);
  strokeWeight(5);
  for (var i in players) {
    if (players[i].n !== p.n) {
      stroke(50);
      if (players[i].hit_immunity > 0) {
        stroke(25, 100, 200);
      }
      fill(200, 50, 50);
      ellipse(players[i].x + ox, players[i].y + oy, 50, 50);
      noStroke();
      fill(0);
      textAlign(CENTER, BOTTOM);
      textSize(24);
      text(players[i].name, players[i].x + ox, players[i].y + oy - 32);
      textSize(16);
      textAlign(CENTER, TOP);
      text(players[i].saying.t + " [" + players[i].health + " HP]", players[i].x + ox, players[i].y + oy + 32);
      if (players[i].shooting && players[i].shooting.bullets) {
        for (var b = 0; b < players[i].shooting.bullets.length; b++) {
          fill(0);
          noStroke();
          ellipse(players[i].shooting.bullets[b].x + ox, players[i].shooting.bullets[b].y + oy, 5, 5);
        }
      }
      if (players[i].placed) {
        for (var pl in players[i].placed) {
          for (var j in players[i].placed[pl]) {
            cur = players[i].placed[pl][j];
            switch(pl) {
              case "turrets":
                noFill();
                stroke(0);
                strokeWeight(5);
                ellipse(cur.x + ox, cur.y + oy, 30, 30);
              break;
            }
            strokeWeight(1);
          }
        }
      }
    }
  }
  if (p.n !== -1) {
    stroke(50);
    if (p.hit_immunity > 0) {
      stroke(25, 100, 200);
    }
    fill(50, 200, 50);
    ellipse(window.innerWidth / 2, window.innerHeight / 2, 50, 50);
    noStroke();
    fill(0);
    textAlign(CENTER, BOTTOM);
    textSize(24);
    text(p.name, window.innerWidth / 2, window.innerHeight / 2 - 32);
    textSize(16);
    textAlign(CENTER, TOP);
    text(p.saying.t + " [" + p.health + " HP]", window.innerWidth / 2, window.innerHeight / 2 + 32);
    for (var b = 0; b < p.shooting.bullets.length; b++) {
      if (p.shooting.bullets[b]) {
        fill(0);
        noStroke();
        ellipse(p.shooting.bullets[b].x + ox, p.shooting.bullets[b].y + oy, 5, 5);
        if (p.n !== -1) {
          for (var i in players) {
            if (p.shooting.bullets[b] && players[i]) {
              if (players[i].n !== p.n && players[i].hit_immunity <= 0) {
                if (dist(p.shooting.bullets[b].x, p.shooting.bullets[b].y, players[i].x, players[i].y) <= 27.5) {
                  ref.hit.child(players[i].name + ":" + players[i].n).set({
                    state: true,
                    by: p.name
                  });
                  p.shooting.bullets.splice(b, 1);
                  b--;
                  break;
                }
              }
            }
          }
        }
      }
    }
    for (var pl in p.placed) {
      for (var j in p.placed[pl]) {
        cur = p.placed[pl][j];
        switch(pl) {
          case "turrets":
            noFill();
            stroke(0);
            strokeWeight(5);
            ellipse(cur.x + ox, cur.y + oy, 30, 30);
          break;
        }
        strokeWeight(1);
      }
    }
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
  }
  miniMap(window.innerWidth - 120, window.innerHeight - 120, 100, 100);
  if (p.n === -1) {
    noStroke();
    fill(0, 50);
    rect(0, 0, window.innerWidth, window.innerHeight);
  }
}

var off, m, closest, d, o;
setInterval(function() {
  if (p.n !== -1) {
    off = rot(window.innerWidth / 2, window.innerHeight / 2, mouseX, mouseY);
    m = min(dist(window.innerWidth / 2, window.innerHeight / 2, mouseX, mouseY) / min(window.innerHeight / 4, window.innerWidth / 4), 1);
    if (m <= 0.05) {
      m = 0;
    }
    p.x += cos(off) * m * 20;
    p.y += sin(off) * m * 20;
    p.x = constrain(p.x, -5000, 5000);
    p.y = constrain(p.y, -5000, 5000);
    if (p.saying.countdown > 0) {
      p.saying.countdown--;
    }
    if (p.shooting.countdown > 0) {
      p.shooting.countdown--;
    }
    for (var i = 0; i < p.shooting.bullets.length; i++) {
      p.shooting.bullets[i].timer--;
      if (p.shooting.bullets[i].timer <= 0) {
        p.shooting.bullets.splice(i, 1);
        i--;
      } else {
        closest = {
          x: 0,
          y: 0,
          d: Infinity
        };
        for (var j = 0; j < players.length; j++) {
          if (players[j] && players[j].n !== p.n) {
            d = dist(p.shooting.bullets[i].x, p.shooting.bullets[i].y, players[j].x, players[j].y);
            if (d < closest.d) {
              closest = {
                user: players[j].name + ":" + players[j].n,
                x: players[j].x,
                y: players[j].y,
                d: d
              };
            }
          }
        }
        o = rot(p.shooting.bullets[i].x, p.shooting.bullets[i].y, closest.x, closest.y);
        p.shooting.bullets[i].xVel += cos(o) * 2;
        p.shooting.bullets[i].yVel += sin(o) * 2;
        p.shooting.xVel = constrain(p.shooting.bullets[i].xVel, -15, 15);
        p.shooting.yVel = constrain(p.shooting.bullets[i].yVel, -15, 15);
        p.shooting.bullets[i].x += p.shooting.bullets[i].xVel;
        p.shooting.bullets[i].y += p.shooting.bullets[i].yVel;
      }
    }
    if (mc && p.shooting.countdown <= 0) {
      p.shooting.bullets.push({
        x: p.x,
        y: p.y,
        xVel: cos(off) * 15,
        yVel: sin(off) * 15,
        timer: 200
      });
      p.shooting.countdown = 2;
    }
    if (kp[16] && p.shooting.countdown <= 0) {
      p.placed.turrets.push({
        x: p.x,
        y: p.y,
        health: 50,
        countdown: 200
      });
      p.shooting.countdown = 2;
    }
    for (var i in p.placed.turrets) {
      if (p.placed.turrets[i].countdown <= 0) {
        p.placed.turrets[i].countdown = 3;
        p.shooting.bullets.push({
          x: p.placed.turrets[i].x,
          y: p.placed.turrets[i].y,
          xVel: 0,
          yVel: 0,
          timer: 100
        });
      }
      p.placed.turrets[i].countdown--;
    }
    checkHit();
    updatePlayer();
    mc = false;
  }
}, 1000 / 50);

function unload() {
  if (p.n !== -1) {
    ref.hit.child(p.name + ":" + p.n).remove();
    ref.p.child(p.name + ":" + p.n).remove();
    p.n = -1;
  }
};

document.ontouchmove = function(e) {
  e.preventDefault();
};
