var stage = new createjs.Stage("game-canvas");
var loader;
var loading = false;
var w, h;
var sky;
var keys = {};
var score;
var gravity = 0.2;
var spriteSheet;
var bullets = {};
var enemies = {};
var powerups = {};
var stars = [];
var current_level = 0;
var star_speed = 5;
var enemy_interval;
var powerup_interval;
var enemies_enabled = false;
var powerups_enabled = false;

var powerup_types = {
  1: "normal",
  2: "split",
  3: "double",
  4: "energy",
  5: "super",
};

var KEYCODE_LEFT = 37,
  KEYCODE_RIGHT = 39,
  KEYCODE_UP = 38,
  KEYCODE_DOWN = 40,
  KEYCODE_SPACE = 32;

if (typeof move === "undefined") {
  var move = function () {};
}
if (typeof shoot === "undefined") {
  var shoot = function () {};
}
if (typeof add_enemies === "undefined") {
  var add_enemies = function () {};
}
if (typeof loop_custom === "undefined") {
  var loop_custom = function () {};
}
if (typeof enemy_hit === "undefined") {
  var enemy_hit = function () {};
}


function keydown(event) {
    keys[event.keyCode] = true;
    if (event.keyCode === KEYCODE_SPACE) {
      shoot();
    }
}

function keyup(event) {
    delete keys[event.keyCode];
}

function init() {
  w = stage.canvas.width;
  h = stage.canvas.height;

  loader = new createjs.LoadQueue(false);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(tile_manifest, true, ".");
}

function handleComplete() {
  sky = new createjs.Shape();
  // sky.graphics.beginBitmapFill(loader.getResult("bg_city")).drawRect(0, 0, 1667, 500);
  stage.addChild(sky);

  ship_spriteSheet = new createjs.SpriteSheet({
		framerate: 6,
		"images": [loader.getResult("ship1")],
		"frames": {"width":40, "height":40, "count":1, "regX": 0, "regY": 0, "spacing":0, "margin":0},
		// define two animations, run (loops, 1.5x speed) and jump (returns to run):
		"animations": {
      "normal": {
        frames: [0],
        next: "normal",
        speed: 10,
      },
		}
	});
  ship = new createjs.Sprite(ship_spriteSheet, "normal");
  ship.setBounds(0, 0, 40, 40);

  ship.move_up = function(speed) {
    ship.y -= speed;
  };

  ship.move_down = function(speed) {
    ship.y += speed;
  };

  ship.move_left = function(speed) {
    ship.x -= speed;
  };

  ship.move_right = function(speed) {
    ship.x += speed;
  };

  createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", tick);

  this.document.onkeydown = keydown;
  this.document.onkeyup = keyup;
  ship.x = 100;
  ship.y = 100;
  ship.powerup = "normal";
  load_code();

  for (var i = 0; i < 20; i++) {
    var star = add_star();
  }
  score = new createjs.Text("Score:", "14px 'Press Start'", "white");
  score.x = 20;
  score.y = 20;
  stage.addChild(score);

  stage.addChild(ship);
}

init();

function tick(event) {
  if (!createjs.Ticker.paused) {
    if (enemies_enabled && !enemy_interval) {
      enemy_interval = setInterval(function () {
        add_enemy(Math.random() * (canvas.width - 80) + 40, -80, Math.floor(Math.random() * 3) + 1);
      }, 750);
    }
    if (powerups_enabled && !powerup_interval) {
      powerup_interval = setInterval(function () {
        add_powerup(Math.floor(Math.random() * 4));
      }, 15000);
    }
    loop_custom();
    move();
    handle_stars();
    var ship_bounds = ship.getBounds();
    if (ship.x < 0) {
      ship.x = 0;
    }
    if (ship.x > canvas.width - ship_bounds.width) {
      ship.x = canvas.width - ship_bounds.width;
    }
    if (ship.y < 0) {
      ship.y = 0;
    }
    if (ship.y > canvas.height - ship_bounds.height) {
      ship.y = canvas.height - ship_bounds.height;
    }
    handle_bullets(ship_bounds);
    handle_enemies();
    handle_powerups();
    stage.update(event);
  }
  else {
    enemy_interval = clearInterval(enemy_interval);
    powerup_interval = clearInterval(powerup_interval);
  }
}

function check_key(keycode) {
  return keys[keycode] || false;
}

function debug_bounds() {
  s = new createjs.Shape();
  s.graphics.beginFill("red").drawRect(0, 0, ship.getBounds().width, ship.getBounds().height);
  s.x = ship.x;
  s.y = ship.y;
  stage.addChild(s);
}

function set_score(n) {
  score = n;
}

function add_bullet() {
  bullet = new createjs.Shape();
  bullet.graphics.beginBitmapFill(loader.getResult("bullet_1")).drawRect(0, 0, 14, 22);
  bullet.x = ship.x + ship.getBounds().width / 2 - 7;
  bullet.y = ship.y - 11;
  bullet.width = 14;
  bullet.height = 22;
  stage.addChild(bullet);
  bullet.ySpeed = -6.5 * ship.scaleX;
  bullet.type = "self";
  bullets[UUID.generate()] = bullet;
  return bullet;
}

function add_enemy_bullet(enemy, x, y) {
  bullet = new createjs.Shape();
  bullet.graphics.beginBitmapFill(loader.getResult("enemy_bullet_1")).drawRect(0, 0, 8, 17);
  bullet.width = 8;
  bullet.height = 17;
  stage.addChild(bullet);
  bullet.ySpeed = 6.5;
  bullets[UUID.generate()] = bullet;
  bullet.x = x;
  bullet.y = y;
  bullet.type = "enemy";
  return bullet;
}

function add_explosion(x, y) {
  fx_spriteSheet = new createjs.SpriteSheet({
    framerate: 2,
    "images": [loader.getResult("fx-1")],
    "frames": {"width":37, "height":37, "count": 6, "regX": 0, "regY": 0, "spacing": 1, "margin": 0},
    // define two animations, run (loops, 1.5x speed) and jump (returns to run):
    "animations": {
       "splode": {
         frames: [0, 1, 2, 3, 4, 5, 6],
         next: false,
         speed: 10,
       },
    }
  });
  fx = new createjs.Sprite(fx_spriteSheet, "splode");
  fx.setBounds(0, 0, 37, 37);
  fx.x = x;
  fx.y = y;
  stage.addChild(fx);
  setTimeout(function () {
    stage.removeChild(fx);
  }, 250);
}

function handle_bullets(ship_bounds) {
  for (var bulletkey in bullets) {
    var bullet = bullets[bulletkey];
    bullet.y += bullet.ySpeed || 0;
    bullet.x += bullet.xSpeed || 0;
    if (bullet.type == "enemy" && bullet.x < ship.x + ship_bounds.width &&
      bullet.x + bullet.width > ship.x &&
      bullet.y < ship.y + ship_bounds.height &&
      bullet.height + bullet.y > ship.y) {
      add_explosion(ship.x, ship.y);
      stage.removeChild(ship);
      ship.x = -100; ship.y = -100;
      move = function () {};
    }
    for (var enemykey in enemies) {
      var enemy = enemies[enemykey];
      if (bullet.type == "self" && bullet.x < enemy.x + enemy.width &&
         bullet.x + bullet.width > enemy.x &&
         bullet.y < enemy.y + enemy.height &&
         bullet.height + bullet.y > enemy.y) {
          enemy_hit(enemy);
          stage.removeChild(bullet);
          delete bullets[bulletkey];
          delete enemies[enemykey];
      }
    }
    if (bullet.y < 0 - 22) {
      delete bullets[bulletkey];
    }
    if (bullet.y > canvas.height) {
      delete bullets[bulletkey];
    }
  }
}

function add_star() {
  star = new createjs.Shape();
  star.graphics.beginFill("rgba(255, 255, 255, 0.6)").drawCircle(0, 0, 3);
  star.x = Math.random() * canvas.width;
  star.y = Math.random() * canvas.height;
  stars.push(star);
  stage.addChild(star);
  return star;
}

function handle_stars() {
  for (var i = 0; i < stars.length; i++) {
    stars[i].y += 2.718;
    if (stars[i].y + 3 > canvas.height) {
      stars[i].x = Math.random() * canvas.width;
      stars[i].y = Math.random() * canvas.height * -1;
    }
  }
}

function add_powerup(type) {
  powerup = new createjs.Shape();
  powerup.graphics.beginBitmapFill(loader.getResult("powerup" + type)).drawRect(0, 0, 24, 19);
  powerup.height = 19;
  powerup.width = 24;
  powerup.ySpeed = 2;
  powerup.x = Math.floor(Math.random() * canvas.width);
  powerup.y = -19;
  powerup.type = type;
  stage.addChild(powerup);
  powerups[UUID.generate()] = powerup;
  return powerup;
}

function handle_powerups() {
  for (var powerupkey in powerups) {
    var powerup = powerups[powerupkey];
    powerup.y += powerup.ySpeed;
    if (powerup.x < ship.x + ship.width &&
      powerup.x + powerup.width > ship.x &&
      powerup.y < ship.y + ship.height &&
      powerup.height + powerup.y > ship.y) {
        ship.powerup = powerup_types[powerup.type];
        stage.removeChild(powerup);
        delete enemies[powerupkey];
    }
    if (powerup.y > canvas.height) {
      stage.removeChild(powerup);
      delete enemies[powerupkey];
    }
  }
}

function add_enemy(x, y, type) {
  enemy = new createjs.Shape();
  sprite = loader.getResult("enemy" + type);
  enemy.x = 0;
  enemy.y = 0;
  enemy.created = new Date();
  enemy.ySpeed = Math.random() * 3 + 1;
  enemy.xSpeed = 0;
  enemy.type = type;
  if (type == 1) {
  }
  if (type == 2) {
    enemy.ySpeed = 2;
  }
  enemy.width = sprite.width;
  enemy.height = sprite.height;
  enemy.graphics.beginBitmapFill(sprite).drawRect(0, 0, sprite.width, sprite.height);
  enemy.x = x;
  enemy.y = y;
  stage.addChild(enemy);
  enemies[UUID.generate()] = enemy;
  return enemy;
}

function handle_enemies() {
  var now = new Date();
  for (var enemykey in enemies) {
    var enemy = enemies[enemykey];
    if (enemy.type == 1) {
      enemy.y += enemy.ySpeed;
      if (enemy.y > 0 && (now - enemy.created) % 1200 < 20) {
        add_enemy_bullet(enemy, enemy.x + 4, enemy.y + enemy.height + 1);
        add_enemy_bullet(enemy, enemy.x + 33, enemy.y + enemy.height + 1);
      }
    } else if (enemy.type == 2) {
      enemy.x = enemy.x + Math.sin(enemy.y / 50) * 2.5;
      enemy.y += enemy.ySpeed;
      if (enemy.y > 0 && (now - enemy.created) % 1200 < 20) {
        add_enemy_bullet(enemy, enemy.x + 4, enemy.y + enemy.height + 1);
        add_enemy_bullet(enemy, enemy.x + 33, enemy.y + enemy.height + 1);
      }
    } else if (enemy.type == 3) {
      enemy.y += enemy.ySpeed;
      enemy.x += enemy.xSpeed;
      if ((new Date() - enemy.created) % 2500 < 50) {
        enemy.ySpeed -= 0.5;
        // enemy.xSpeed += 1;
      }
    }
    if (enemy.y > canvas.height) {
      stage.removeChild(enemy);
      delete enemies[enemykey];
    }
  }
}
