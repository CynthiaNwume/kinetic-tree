import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import './App.css';

/** * BST LOGIC: Recursive Insertion
 * In a Binary Search Tree, we compare the new value to the current node:
 * - If smaller: Move to the left child.
 * - If larger: Move to the right child.
 * - If null: We've found the empty slot to create the new node.
 */
const insertNode = (node, value) => {
  // 1. Create a new node object if we hit an empty leaf
  if (node === null) {
    return { 
      id: Math.random().toString(36).substr(2, 9), 
      value, 
      left: null, 
      right: null, 
      x: 0, 
      y: 0 
    };
  }

  // 2. Standard BST Traversal logic
  if (value < node.value) {
    node.left = insertNode(node.left, value);
  } else if (value > node.value) {
    node.right = insertNode(node.right, value);
  }

  // Return the node to maintain the recursive tree link
  return node;
};

/**
 * COORDINATE MATH: Recursive Positioning
 * This function determines where on the screen a node should sit.
 * To prevent overlapping, 'spacing' is halved at every depth level.
 */
const calculatePositions = (node, x, y, spacing) => {
  if (!node) return;

  // Set the current node's screen coordinates
  node.x = x;
  node.y = y;

  // Calculate positions for children (80px vertical drop per level)
  calculatePositions(node.left, x - spacing, y + 80, spacing / 1.8);
  calculatePositions(node.right, x + spacing, y + 80, spacing / 1.8);
};

/**
 * HELPER: Flattening the Tree
 * React's .map() function works on arrays, not nested objects.
 * We flatten the tree into a list of nodes so we can render them easily.
 */
const flattenTree = (node, nodes = []) => {
  if (!node) return nodes;
  nodes.push(node);
  flattenTree(node.left, nodes);
  flattenTree(node.right, nodes);
  return nodes;
};

/**
 * HELPER: Line Connections
 * Creates pairs of {from, to} coordinates for the SVG lines (edges).
 */
const getConnections = (node, connections = []) => {
  if (!node) return connections;
  if (node.left) {
    connections.push({ from: { x: node.x, y: node.y }, to: { x: node.left.x, y: node.left.y } });
    getConnections(node.left, connections);
  }
  if (node.right) {
    connections.push({ from: { x: node.x, y: node.y }, to: { x: node.right.x, y: node.right.y } });
    getConnections(node.right, connections);
  }
  return connections;
};

/**
 * COMPONENT: Hero Character
 * Uses Framer Motion to smoothly slide the sprite to the targetPos.
 */
const HeroCharacter = ({ targetPos, isJumping }) => (
  <Motion.div
    animate={{ 
      x: targetPos.x, 
      y: isJumping ? targetPos.y - 60 : targetPos.y - 40 
    }}
    transition={{ type: "spring", stiffness: 120, damping: 14 }}
    style={{ 
      position: 'absolute', 
      fontSize: '40px', 
      zIndex: 60, 
      pointerEvents: 'none', 
      filter: 'drop-shadow(0 0 10px #bc13fe)' 
    }}
  >
    👾
  </Motion.div>
);

export default function App() {
  // STATE MANAGEMENT
  const [_TREE, _SET_TREE] = useState(null); // The actual BST data
  const [inputValue, setInputValue] = useState(''); // Current text in input
  const [heroPos, setHeroPos] = useState({ x: (window.innerWidth - 320) / 2, y: 80 });
  const [isJumping, setIsJumping] = useState(false); // Controls the "Victory Jump"
  const [status, setStatus] = useState('SYSTEM_IDLE'); // Message displayed in header

  /**
   * ANIMATION: Pathfinding Simulation
   * This mimics the BST search logic but adds delays so the user
   * can watch the 👾 move step-by-step.
   */
  const walkPath = async (value) => {
    let current = _TREE;
    let centerX = (window.innerWidth - 320) / 2;
    let path = [{ x: centerX, y: 80 }];

    // Build a list of coordinates the character must visit
    while (current) {
      path.push({ x: current.x, y: current.y });
      if (value < current.value) current = current.left;
      else if (value > current.value) current = current.right;
      else break;
    }

    // Iterate through the path with a 400ms delay per step
    for (const pos of path) {
      setHeroPos(pos);
      await new Promise(r => setTimeout(r, 400));
    }
    return current;
  };

  /**
   * HANDLER: Insert Action
   * Combines logic, animation, and state updates.
   */
  const handleInsert = async (e) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    setStatus(`LOCATING_SECTOR_${val}...`);
    
    // 1. Run the walking animation first
    await walkPath(val);

    // 2. Clone the tree (React requires immutable state updates)
    const newTree = _TREE ? JSON.parse(JSON.stringify(_TREE)) : null;
    const updatedTree = insertNode(newTree, val);
    
    // 3. Recalculate screen positions for the updated tree
    let centerX = (window.innerWidth - 320) / 2;
    calculatePositions(updatedTree, centerX, 80, 200);

    // 4. Finalize state updates
    _SET_TREE(updatedTree);
    setInputValue('');
    setStatus(`NODE_${val}_STABILIZED`);
    
    // 5. Trigger victory animation
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 300);
  };

  const handleReset = () => {
    _SET_TREE(null);
    setStatus('MEMORY_PURGED');
    setHeroPos({ x: (window.innerWidth - 320) / 2, y: 80 });
  };

  return (
    <div className="app-container">
      {/* --- HEADER SECTION --- */}
      <header className="header">
        <h1 style={{ margin: '10px 0', fontSize: '24px' }}>KINETIC_TREE_V1.0</h1>
        <div className="status-bar">{status}</div>
      </header>

      <div className="main-layout">
        {/* --- CENTRAL VIEWPORT: The BST Visualizer --- */}
        <main className="visualizer-container">
          <div className="control-panel">
            <form onSubmit={handleInsert}>
              <input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="DATA_ID" 
              />
              <button type="submit">INSERT</button>
            </form>
          </div>

          <HeroCharacter targetPos={heroPos} isJumping={isJumping} />

          {/* BACKGROUND LAYER: SVG Connections */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {getConnections(_TREE).map((conn, i) => (
              <Motion.line 
                key={i} 
                animate={{ x1: conn.from.x + 20, y1: conn.from.y + 20, x2: conn.to.x + 20, y2: conn.to.y + 20 }} 
                stroke="#bc13fe" 
                strokeWidth="1.5" 
                strokeOpacity="0.4" 
              />
            ))}
          </svg>

          {/* TOP LAYER: Interactive Nodes */}
          <AnimatePresence>
            {flattenTree(_TREE).map((node) => (
              <Motion.div 
                key={node.id} 
                initial={{ scale: 0 }} 
                animate={{ x: node.x, y: node.y, scale: 1 }} 
                style={{ 
                  position: 'absolute', 
                  width: '40px', 
                  height: '40px', 
                  border: '1px solid #00f3ff', 
                  background: 'rgba(0,243,255,0.05)', 
                  color: '#00f3ff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px', 
                  fontWeight: 'bold' 
                }}
              >
                {node.value}
              </Motion.div>
            ))}
          </AnimatePresence>
        </main>

        {/* --- SIDEBAR SECTION: Technical Insights --- */}
        <aside className="sidebar">
          <div>
            <div className="intel-title">SYSTEM_OVERVIEW</div>
            <p className="intel-text">
              KineticTree is a high-fidelity Binary Search Tree (BST) visualizer. 
              It maps abstract data structures into a physical coordinate plane.
            </p>

            <div className="intel-title">TECH_STACK</div>
            <div style={{ marginBottom: '15px' }}>
              <span className="tech-tag">React.js</span>
              <span className="tech-tag">Framer Motion</span>
              <span className="tech-tag">SVG_Render</span>
              <span className="tech-tag">JavaScript_ES6</span>
            </div>

            <div className="intel-title">ALGORITHM_STATS</div>
            <p className="intel-text">
              <strong>STRUCTURE:</strong> BST<br/>
              <strong>TIME_COMPLEXITY:</strong> O(log n)<br/>
              <strong>SPACE_COMPLEXITY:</strong> O(n)
            </p>

            <div className="intel-title">CHARACTER_LOG</div>
            <p className="intel-text">
              The 👾 scout performs an asynchronous pathfinding routine to validate 
              node sectors before stabilization.
            </p>
          </div>

          <button className="reboot-btn" onClick={handleReset}>
            REBOOT_SYSTEM
          </button>
        </aside>
      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="footer">
        DEVELOPER: Cynthia Nwume // STATUS: ONLINE // SECTOR: 7G
      </footer>
    </div>
  );
}