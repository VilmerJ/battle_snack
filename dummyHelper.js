export const getLegalMoves = (myBody, boardWidth, boardHeight, snakes) => {
  let isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  const myHead = myBody[0];
  const myNeck = myBody[1];

  // Don't let the snake move back on itself
  if (myNeck.x < myHead.x) {
    isMoveSafe.left = false;
  } else if (myNeck.x > myHead.x) {
    isMoveSafe.right = false;
  } else if (myNeck.y < myHead.y) {
    isMoveSafe.down = false;
  } else if (myNeck.y > myHead.y) {
    isMoveSafe.up = false;
  }

  // Check out of bounds X
  if (myHead.x === 0) {
    isMoveSafe.left = false;
  } else if (myHead.x === boardWidth - 1) {
    isMoveSafe.right = false;
  }
  // Check out of bounds Y
  if (myHead.y === 0) {
    isMoveSafe.down = false;
  } else if (myHead.y === boardHeight - 1) {
    isMoveSafe.up = false;
  }

  // Check for collisions with some snake
  const newHeadPositions = {
    up: { x: myHead.x, y: myHead.y + 1 },
    down: { x: myHead.x, y: myHead.y - 1 },
    left: { x: myHead.x - 1, y: myHead.y },
    right: { x: myHead.x + 1, y: myHead.y },
  };

  for (const snake of snakes) {
    for (const move in newHeadPositions) {
      if (!isMoveSafe[move]) {
        continue;
      }

      const newHead = newHeadPositions[move];
      if (
        snake.body.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        isMoveSafe[move] = false;
      }
    }
  }

  return isMoveSafe;
};
