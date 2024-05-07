export const evaluation = (ourSnakes, enemySnakes) => {
  let ourLength = 0;
  let ourHP = 0;

  let enemyLength = 0;
  let enemyHP = 0;

  for (const snake of ourSnakes) {
    ourLength += snake.length;
    ourHP += snake.health;
  }

  for (const snake of enemySnakes) {
    enemyLength += snake.length;
    enemyHP += snake.health;
  }

  return ourLength - enemyLength + ourHP - enemyHP;
};
