# Step 1: Set up the game.
There are a couple things we need to do before we can start programming our game.

1. We need to disable enemies. While we're programming, we don't want to have any enemies getting in the way.
2. Set the ship 80% down the screen.
3. Set the current score to 0.

Follow along with the code below and type it into the code area on your screen to set up the game.

```js
enemies_enabled = false;
ship.y = canvas.height * 0.8;
current_score = 0;
```

# Step 2: Add the move function.
Our first step to making our game playable is to let our players move the ship. To move our ship, we need to check if the arrow keys are pressed, then move in that direction.

Follow along with the code below and type it into the code area on your screen to get our ship moving.

```js
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
```

# Step 3: Add the shoot function.
Now that our ship can move, let's add a way to fire our lasers at the enemy ships. These are the steps we'll take to fire the lasers:

1. Check if the spacebar is pressed.
2. If the spacebar is pressed, add a new bullet.
3. Change the bullet's `x` and `y` position (where the bullet is on the screen) so it's just above our ship.

Use the code below to add a shoot function to the game. Make sure you click "Save Code" at the top of the screen after each step.

```js
function shoot() {
    if (check_key(KEYCODE_SPACE)) {
        var bullet = add_bullet();
        bullet.x = ship.x + 13;
        bullet.y = ship.y - 5;
    }
}
```

# Step 4: Add a function to update the score.
In order to make our game fun, we need to update our score to keep track of how many enemies we've shot.

To do that, we can change `score.text` to `Score: <current_score>`.

Follow along with the code below and type it into the code area of your screen to add a function that updates the score.

```js
function update_score() {
  score.text = "Score: " + current_score;
}
```

# Step 5: Add the enemy_hit function.
We need to make a way to remove enemies after shooting them. Let's look at the steps we'll take to do that:

1. Remove the enemy from the screen.
2. Add an explosion where the enemy was.
3. Add 1 to the score.
4. Update the score.

Follow along with the code below, typing it into bottom of the code area on your screen.

```js
function enemy_hit(enemy) {
  add_explosion(enemy.x, enemy.y);
  stage.removeChild(enemy);
  current_score += 1;
  update_score();
}
```

# Step 6: Finish
Now it's time to finish the game. We only have one more thing to do: enable the enemies. Change the `enemies_enabled` line at the top of your code to use `true` instead of `false`.

**Watch out!** Make sure you save before you enable enemies.

```js
enemies_enabled = true;
```

# Bonus
There are many ways to make our game a lot more cool. Here's an idea that you can use. Try to think of new features for the game and write them yourself!

## Add Power Ups
First, we'll create a new function called `loop_custom` that will 60 times per second. Inside the function, check the current_score to see if you've reached 5 and 15 points. You can change the numbers to make it easier or more difficult if you want.

```js
function loop_custom() {
    if (current_score < 5) {
        ship.powerup = "normal";
    }
    if (current_score > 5)
        ship.powerup = "double";
    }
    if (current_score > 15) {
        ship.powerup = "split";
    }
}
```

Now, you can change your `shoot` function to use the powerups. You can use the example below, or write your own powerups.

```js
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
          bullet.y = ship.y - 5;
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
```
