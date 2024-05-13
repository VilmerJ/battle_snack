export const generateNewState = (state, snakeId, move, turn) => {
  // Create a deep copy of the board
  const newState = JSON.parse(JSON.stringify(state));
  const ourSnakes = turn % 2 === 0 ? newState.ourSnakes : newState.enemySnakes;

  // Find the snake that is moving
  const snake = ourSnakes.find((snake) => snake.id === snakeId);

  // If the snake is dead we remove the snake and return the new state
  if (snake.dead) {
    const newSnakes = ourSnakes.filter((snake) => snake.id !== snakeId);
    if (turn % 2 === 0) {
      newState.ourSnakes = newSnakes;
    } else {
      newState.enemySnakes = newSnakes;
    }
    return newState;
  }

  moveSnake(newState, move, snake);
  return newState;
};

const moveSnake = (state, move, snake) => {
  const newHead = moveHead(newSnake.head, move);
  newSnake.body = [newHead, ...newSnake.body];
  newSnake.head = newHead;

  const ateFood = state.food.some(
    (food) => food.x === newHead.x && food.y === newHead.y
  );

  if (!ateFood) {
    newSnake.body.pop();
    snake.health -= 1;
  } else {
    newSnake.health = 100;
    newSnake.length += 1;

    // Remove the food that was eaten
    state.food = state.food.filter(
      (food) => food.x !== newHead.x || food.y !== newHead.y
    );
  }
};

const moveHead = (head, move) => {
  switch (move) {
    case "up":
      return { x: head.x, y: head.y + 1 };
    case "down":
      return { x: head.x, y: head.y - 1 };
    case "left":
      return { x: head.x - 1, y: head.y };
    case "right":
      return { x: head.x + 1, y: head.y };
  }
};

export const isTerminal = (state) => {
  if (!state.ourSnakes || !state.enemySnakes) return true;
  if (state.ourSnakes.length === 0 || state.enemySnakes.length === 0)
    return true;
  return false;
};
