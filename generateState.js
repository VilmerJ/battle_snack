export const generateNewBoard = (board, snakeId, move) => {
  // Create a deep copy of the board
  const newBoard = JSON.parse(JSON.stringify(board));

  // Update the board with the new snake position
  const newSnake = moveSnake(
    newBoard.snakes.find((snake) => snake.id === snakeId),
    move,
    newBoard.food
  );

  // Update snake positions on the board
  newBoard.snakes = newBoard.snakes.map((snake) =>
    snake.id === snakeId ? newSnake : snake
  );

  return newBoard;
};

// Update the snake's body and head
export const moveSnake = (snake, move, foodPositions) => {
  const newSnake = JSON.parse(JSON.stringify(snake));

  // Update the snake's body
  newSnake.body = moveSnakeBody(newSnake, move, foodPositions);

  // Update the snake's head
  newSnake.head = newSnake.body[0];

  return newSnake;
};

// Update the snak
export const moveSnakeBody = (newSnake, move, foodPositions) => {
  const newBody = JSON.parse(JSON.stringify(newSnake.body));

  // Insert the new head at the front of the body
  newBody.unshift(moveSnakeHead(newBody[0], move));

  let foodEatenIndex = foodPositions.findIndex(
    (food) => food.x === newBody[0].x && food.y === newBody[0].y
  );
  if (foodEatenIndex !== -1) {
    // If the snake eats food
    newSnake.health = 100;
    foodPositions.splice(foodEatenIndex, 1);
    return newBody;
  }

  // If the snake doesn't eat food
  newSnake.health -= 1;
  newBody.pop();
  return newBody;
};

export const moveSnakeHead = (head, move) => {
  const newHead = JSON.parse(JSON.stringify(head));

  switch (move) {
    case "up":
      newHead.y += 1;
      break;
    case "down":
      newHead.y -= 1;
      break;
    case "left":
      newHead.x -= 1;
      break;
    case "right":
      newHead.x += 1;
      break;
  }

  return newHead;
};
