import { generateNewState } from "./generateState";
import { getLegalMoves } from "./helpers";
import { evaluation } from "./evaluation";

const EXPLORATION_CONSTANT = Math.sqrt(2);
const MAX_SIMULATIONS_DEPTH = 40;
const MAX_TIME = 100; // 100 ms
const NUMBER_OF_SIMULATIONS = 0;



class Node {
  constructor(state, parent = null) {
    this.state = state;
    this.parent = parent;
    this.children = [];
    this.visits = 0;
    this.score = 0;
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
// 1. Selection: Start from the root and succesively chose children until a "leaf" node is reached L
// Nodes are chosen based on their UCB1 value

// 2. Expansion: Unless L ends the game, create one or more child nodes (expand L) and choose a child C.
// If the node L has not been visited we jump directly to the simulation. If it has been visited before we first expand it 
// and go to 1 with our current node L as the root

// 3. Simulation (roll-out/playout): From C, complete a rollout where random moves are chosen until a depth is reached or the game ends
// 4. Backpropogation: Use the result of the playout to update infromation in the nodes on the path from C to R
//                  Each node gets a score (cumulative), and a value (score/number of visists)

export const monteCarloTreeSearch = (state) => {
  const root = new Node(state);

  const start = Date.now(); 
  while (Date.now() - start < MAX_TIME) {
    const node = select(root); // 1. Selection (leaf node which maximizes UCB1)
    // 2. Exapnd node if we have visited it before
    if (node.children.length == 0 && node.visits > 0) {
      expand(node);
      // Select one of the children
      node = select(node);
    }
    const result = simulate(node.state, 0); // 3. Simulate from the selected node
    backpropagate(node, result); // 4. Backpropagation
    NUMBER_OF_SIMULATIONS ++; // Increment number of simulations
  }

  return bestChild(root).state;
};

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

const UCB1 = (node) =>{
      // Nodes that have not been visited are preferred over others
      const score = node.visits == 0 ? Infinity :  node.score + EXPLORATION_CONSTANT * Math.sqrt(Math.log(NUMBER_OF_SIMULATIONS) / child.visits); 
      return score;
}

// Returns the child of a node which maximizes the UCB1 formula
const bestUCT = (node) => {
  let bestChild = null;
  let bestUCT = -Infinity;

  for (const child of node.children) {
      const uct = UCB1(child);
      // Kan man göra såhär?
      if (uct == Infinity) {
        bestUCT = uct;
        bestChild = child;
        break;
      }else if (UCB1(child) > bestUCT) {
        bestUCT = uct;
        bestChild = child;
    }
  }

  return bestChild;
};

// 2. Expands a node with the elligble moves
const expand = (node) =>{
  // Iterate over the legal moves
  for (const move of getLegalMoves(node.state.snakes[0])) { // Requires additional arguments (?)
    const newState = generateNewState(node.state, move);
    const child = new Node(newState, node);
    node.addChild(child);
  }
}

// 3. Simulation until we reach an end node or exit criteria is met
const simulate = (node,depth, startTime) => {
  
  // Simulate until stop criterion is reached
  while (depth < MAX_SIMULATIONS_DEPTH ||Date.now() - startTime < MAX_TIME) {
    
    // Get possible moves
    const possibleMoves = getLegalMoves(node.body.state.snakes[0]); // this is very wrong function call
    // We have reached a terminal state -> return evaluation
    if (possibleMoves.length == 0) {
      break;
    }
    
    const randomMove = possibleMoves[Math.random() * (Math.floor(possibleMoves.length))];
    node = new Node(generateNewState(node.state, 0, randomMove)); // Incorrect function call
  }
  return evaluation(node.state); // Incorrect function call
}

const backpropagate = (node, result) => {
  while (node !== null) {
    node.visits += 1;
    node.score += result;
    node = node.parent;
  }
};

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

  return bestChild;
};

// // Old recursive version
// const simulate = (node, depth) => {
//   // Check if depth has been reached, maybe also have time check??
//   if (depth > MAX_SIMULATIONS_DEPTH) {
//     return evaluation(currentState.snakes, currentState.snakes);
//   }

//   // Expand the current node (this step should probably be done later)
//   if (this.children.length === 0) {
//     expand(node);
//   }

//   // Chose the child which maximizes UCB1
//   const bestChild = select(node);
//   if (bestChild === null) {
//     return evaluation(currentState.snakes, currentState.snakes);
//   }

//   return simulate(bestChild, depth + 1);
// };