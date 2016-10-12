enemies_enabled = true;
ship.powerup = "normal";
ship.y = canvas.height * 0.8;
current_score = 0;

function update_score() {
  score.text = "Score: " + current_score;
}

function move(keycode) {
  if (check_key(KEYCODE_RIGHT)) {
    ship.move_right(3);
  }
  if (check_key(KEYCODE_LEFT)) {
    ship.move_left(3);
  }
  if (check_key(KEYCODE_UP)) {
    ship.move_up(3);
  }
  if (check_key(KEYCODE_DOWN)) {
    ship.move_down(3);
  }
}

function shoot() {
  if (check_key(KEYCODE_SPACE)) {
    if (ship.powerup == "normal") {
      var bullet = add_bullet();
      bullet.x = ship.x + 13;
      bullet.y = ship.y - 5;
    } else if (ship.powerup == "double") {
      var bullet = add_bullet();
      bullet.x = ship.x + 1;
      bullet.y = ship.y - 5;
      var bullet2 = add_bullet();
      bullet2.x = ship.x + 25;
      bullet2.y = ship.y - 5;
    } else if (ship.powerup == "split") {
      var bullet = add_bullet();
      bullet.x = ship.x + 13;
      bullet.y = ship.y - 5
      var bullet2 = add_bullet();
      bullet2.x = ship.x + 28;
      bullet2.xSpeed = 2;
      bullet2.rotation = 15;
      var bullet3 = add_bullet();
      bullet3.x = ship.x;
      bullet3.y = ship.y - 5;
      bullet3.xSpeed = -2;
      bullet3.rotation = -15;
    }
  }
}

function enemy_hit(enemy) {
  add_explosion(enemy.x, enemy.y);
  stage.removeChild(enemy);
  current_score += 1;
  update_score();
}

function loop_custom() {
    if (current_score < 5) {
        ship.powerup = "normal";
    }
    if (current_score > 5) {
        ship.powerup = "double";
    }
    if (current_score > 15) {
        ship.powerup = "split";
    }
}
