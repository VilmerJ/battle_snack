export const generateNewState = (state, snakeId, move, turn) => {
  // Create a deep copy of the board
  const newState = JSON.parse(JSON.stringify(state));
  const ourSnakes = turn % 2 === 0 ? newState.ourSnakes : newState.enemySnakes;

  // Find the snake that is moving
  const snake = ourSnakes.find((snake) => snake.id === snakeId);

  // If the snake is dead we remove the snake and return the new state
  if (move === "death") {
    const newSnakes = ourSnakes.filter((snake) => snake.id !== snakeId);
    if (turn % 2 === 0) {
      newState.ourSnakes = newSnakes;
    } else {
      newState.enemySnakes = newSnakes;
    }
    return newState;
  }

  moveSnake(newState, move, snake);

  // Iterate over our snakes snakes
  // If two snakes have the same head position, remove the shortest one, or both if the length is the same
  for (
    let ourSnakesIndex1 = 0;
    ourSnakesIndex1 < newState.ourSnakes.length;
    ourSnakesIndex1++
  ) {
    for (
      let ourSnakesIndex2 = 0;
      ourSnakesIndex2 < newState.ourSnakes.length;
      ourSnakesIndex2++
    ) {
      if (
        ourSnakesIndex1 !== ourSnakesIndex2 &&
        newState.ourSnakes[ourSnakesIndex1].head ===
          newState.ourSnakes[ourSnakesIndex2].head
      ) {
        // remove the snake with the given ID
      }
    }
  }

  return newState;
};

const moveSnake = (state, move, snake) => {
  const newHead = moveHead(snake.head, move);
  snake.body = [newHead, ...snake.body];
  snake.head = newHead;

  const ateFood = state.food.some(
    (food) => food.x === newHead.x && food.y === newHead.y
  );

  if (!ateFood) {
    snake.body.pop();
    snake.health -= 1;
  } else {
    snake.health = 100;
    snake.length += 1;

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
  return !!(state.ourSnakes.length === 0 || state.enemySnakes.length === 0);
};
