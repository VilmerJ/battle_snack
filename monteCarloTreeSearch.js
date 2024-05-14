import { generateNewState, isTerminal } from "./generateState.js";
import { getLegalMoves, purgeSnakes } from "./helpers.js";
import { evaluation } from "./evaluation.js";

const EXPLORATION_CONSTANT = Math.sqrt(2);
const MAX_SIMULATIONS_DEPTH = 50;
const MAX_TIME = 400; // 100 ms
let maxDepthReached = 0;
let getLegalMovesCounter = 0;
let getLegalMovesTime = 0;
let generateStateCounter = 0;
let generateStateTime = 0;

class Node {
  constructor(state, turn, parent = null) {
    this.state = state;
    this.parent = parent;
    this.children = [];
    this.visits = 0;
    this.score = 0;
    this.turn = turn;
    this.isTerminal = isTerminal(state);
  }

  addChild(child) {
    this.children.push(child);
  }

  reCalculateScore() {
    const totalScore = this.children.reduce((acc, child) => {
      return acc + child.score;
    }, 0);
    this.score = totalScore / this.visits;
  }
}

// Algorithm contains 4 major steps: https://www.youtube.com/watch?v=UXW2yZndl7U
// 1. Selection: Start from the root and succesively chose children until a leaf node L is reached
// Nodes are chosen based on their UCB1 value

// 2. Expansion: If the node L has not been visited we jump directly to the simulation.
// If it has been visited before we first expand it (if it has not been expanded)
// We then find the child which maximizes UCB1 (go back to 1 with L as root)

// 3. Simulation (roll-out/playout): From the selected node C,
// Perform a rollout where random moves are chosen until an exit criteria is met or the game ends
// Evaluate this final state

// 4. Backpropogation: Use the result of the playout to update infromation in the nodes on the path from C to R
// Each node has a score (cumulative) and a number of visits

export const monteCarloTreeSearch = (state) => {
  maxDepthReached = 0;
  generateStateCounter = 0;
  generateStateTime = 0;
  getLegalMovesCounter = 0;
  getLegalMovesTime = 0;

  const start = Date.now();
  const root = new Node(state, 0, null);
  let numberOfSimulations = 0;
  while (Date.now() - start < MAX_TIME) {
    let node = select(root); // 1. Selection (leaf node which maximizes UCB1)
    // 2. Exapnd node if we have visited it before
    if (node.children.length === 0 && node.visits > 0 && !node.isTerminal) {
      expand(node);
      // Select one of the children
      node = select(node);
    }
    const result = simulate(node, 0); // 3. Simulate from the selected node
    backpropagate(node, result); // 4. Backpropagation
    numberOfSimulations++; // Increment number of simulations
  }
  console.log(
    "Average simulation time: ",
    (Date.now() - start) / numberOfSimulations
  );
  console.log("Performed simulations: ", numberOfSimulations);
  console.log("Max depth reached: ", maxDepthReached / 2);
  console.log("Time spent on MCTS: ", Date.now() - start);
  console.log(
    "Time spent on generating states: ",
    generateStateTime,
    " Calls: ",
    generateStateCounter,
    " Average time: ",
    generateStateTime / generateStateCounter
  );
  console.log(
    "Time spent on finding legal moves: ",
    getLegalMovesTime,
    " Calls: ",
    getLegalMovesCounter,
    " Average time: ",
    getLegalMovesTime / getLegalMovesCounter
  );
  return bestChild(root);
};

// %%%%%%%%%% Util functions %%%%%%%%%%

// UCB1 formula
const UCB1 = (node) => {
  // Nodes that have not been visited are preferred over others
  const score =
    node.visits === 0
      ? Infinity
      : node.score +
        EXPLORATION_CONSTANT *
          Math.sqrt(Math.log(node.parent.visits) / node.visits);
  return score;
};

// Returns the child of a node which maximizes the UCB1 formula
const bestUCT = (node) => {
  let bestChild = null;
  let bestUCT = -Infinity;

  for (const child of node.children) {
    const uct = UCB1(child);
    // Kan man göra såhär?
    if (uct === Infinity) {
      bestUCT = uct;
      bestChild = child;
      break;
    } else if (UCB1(child) > bestUCT) {
      bestUCT = uct;
      bestChild = child;
    }
  }

  return bestChild;
};

// Returns the child with the best score to visists ratio
const bestChild = (node) => {
  let bestChild = null;
  let bestScore = -Infinity;

  for (const child of node.children) {
    const score = child.score / child.visits;
    if (score > bestScore) {
      bestScore = score;
      bestChild = child;
    }
  }

  const ourPos = node.state.ourSnakes[0].head;
  if (bestChild.state.ourSnakes.length === 0) {
    return "up";
  }

  const ourNextPos = bestChild.state.ourSnakes[0].head;

  const move =
    ourPos.x === ourNextPos.x
      ? ourPos.y < ourNextPos.y
        ? "up"
        : "down"
      : ourPos.x < ourNextPos.x
      ? "right"
      : "left";

  return move;
};

// 1. Selection:
//  Returns the child which maximizes UCB1
const select = (node) => {
  //Base case: we have reached a leaf node
  if (node.children.length === 0) {
    return node;
  }
  // If current node has children we find the best child
  const bestChild = bestUCT(node);
  // Recursive call until we reach a leaf node
  return select(bestChild);
};

// 2. Expands a node with the elligble moves
const expand = (node) => {
  // Select the right team
  const ourSnakes =
    node.turn % 2 === 0 ? node.state.ourSnakes : node.state.enemySnakes;

  // 1. Generate legal moves for snake 1.1
  let legalMoveStart = Date.now();
  const movesObj = getLegalMoves(node.state, ourSnakes[0].id, node.turn);
  getLegalMovesCounter++;
  getLegalMovesTime += Date.now() - legalMoveStart;

  const moves = Object.keys(movesObj).filter((key) => movesObj[key]);

  // 2. Generate the next states s2.1 based on the moves
  let stateStart = Date.now();
  const states = moves.map((move) =>
    generateNewState(node.state, ourSnakes[0].id, move, node.turn)
  );
  generateStateCounter += states.length;
  generateStateTime += Date.now() - stateStart;

  if (ourSnakes.length === 1) {
    const children = states.map(
      (state) => new Node(state, node.turn + 1, node)
    );

    node.children = children;
    return;
  }

  // 4. Generate the next states s2.2 based on the moves of snake 2
  const states2 = [];
  for (const state of states) {
    // 3. Get the legal moves for snake 1.2 on states s2.1
    legalMoveStart = Date.now();
    const moves2Obj = getLegalMoves(node.state, ourSnakes[1].id, node.turn);
    getLegalMovesCounter++;
    getLegalMovesTime += Date.now() - legalMoveStart;

    const moves2 = Object.keys(moves2Obj).filter((key) => moves2Obj[key]);
    stateStart = Date.now();
    moves2.forEach((move) => {
      states2.push(generateNewState(state, ourSnakes[1].id, move, node.turn));
    });
    generateStateCounter += moves2.length;
    generateStateTime += Date.now() - stateStart;
  }

  // 4.5 Purge colliding snakes in the states
  states2.map((state) => purgeSnakes(state));

  // 5. Create the nodes for the states s2.2
  const children = states2.map((state) => new Node(state, node.turn + 1, node));

  // 6. Add the children to the parent node
  node.children = children;
};

//3. Simulation until we reach an end node or exit criteria is met
const simulate = (node, depth, startTime) => {
  // Simulate until stop criterion is reached

  let tempNode = new Node(JSON.parse(JSON.stringify(node.state)), node.turn);
  while (tempNode.turn < MAX_SIMULATIONS_DEPTH && !isTerminal(tempNode.state)) {
    // Get possible moves
    const ourSnakes =
      tempNode.turn % 2 === 0
        ? tempNode.state.ourSnakes
        : tempNode.state.enemySnakes;

    // 1. Generate legal moves for snake 1.1
    let legalMovesStart = Date.now();
    const movesObj = getLegalMoves(
      tempNode.state,
      ourSnakes[0].id,
      tempNode.turn
    );
    getLegalMovesCounter++;
    getLegalMovesTime += Date.now() - legalMovesStart;

    const moves = Object.keys(movesObj).filter((key) => movesObj[key]);
    const move = moves[Math.floor(Math.random() * moves.length)];

    // 2. Generate the next states s2.1 based on the moves
    let generateStateStart = Date.now();
    const state = generateNewState(
      tempNode.state,
      ourSnakes[0].id,
      move,
      tempNode.turn
    );
    generateStateCounter++;
    generateStateTime += Date.now() - generateStateStart;

    if (ourSnakes.length === 1) {
      tempNode = new Node(state, tempNode.turn + 1);
      continue;
    }

    // 3. Get the legal moves for snake 1.2 on states s2.1
    legalMovesStart = Date.now();
    const moves2Obj = getLegalMoves(state, ourSnakes[1].id, tempNode.turn);
    getLegalMovesCounter++;
    getLegalMovesTime += Date.now() - legalMovesStart;

    const moves2 = Object.keys(moves2Obj).filter((key) => moves2Obj[key]);
    const move2 = moves2[Math.floor(Math.random() * moves2.length)];

    // 4. Generate the next states s2.2 based on the moves of snake 2
    generateStateStart = Date.now();
    const state2 = generateNewState(
      state,
      ourSnakes[1].id,
      move2,
      tempNode.turn
    );
    generateStateCounter++;
    generateStateTime += Date.now() - generateStateStart;
    // 4.5 Purge colliding snakes
    purgeSnakes(state2);

    // 5. Create the nodes for the states s2.2
    tempNode = new Node(state2, tempNode.turn + 1);
  }

  // Benchmark search depth
  if (tempNode.turn > maxDepthReached) {
    maxDepthReached = tempNode.turn;
  }

  return evaluation(
    tempNode.state.ourSnakes ?? [],
    tempNode.state.enemySnakes ?? []
  );
};

// 4. Backpropagation
const backpropagate = (node, result) => {
  while (node !== null) {
    node.visits += 1;
    node.score += node.turn % 2 == 0 ? -result : result; // We want to maximize the score of the first player
    node = node.parent;
  }
};
