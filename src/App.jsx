import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import './App.css';

/**
 * BST LOGIC: Recursive Insertion
 */
const insertNode = (node, value) => {
  if (node === null) {
    return { id: Math.random().toString(36).substr(2, 9), value, left: null, right: null, x: 0, y: 0 };
  }
  if (value < node.value) {
    node.left = insertNode(node.left, value);
  } else if (value > node.value) {
    node.right = insertNode(node.right, value);
  }
  return node;
};

/**
 * MATH: Coordinate Calculation
 */
const calculatePositions = (node, x, y, spacing) => {
  if (!node) return;
  node.x = x;
  node.y = y;
  calculatePositions(node.left, x - spacing, y + 80, spacing / 1.8);
  calculatePositions(node.right, x + spacing, y + 80, spacing / 1.8);
};

const flattenTree = (node, nodes = []) => {
  if (!node) return nodes;
  nodes.push(node);
  flattenTree(node.left, nodes);
  flattenTree(node.right, nodes);
  return nodes;
};

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

const HeroCharacter = ({ targetPos, isJumping }) => (
  <Motion.div
    animate={{ x: targetPos.x + 5, y: isJumping ? targetPos.y - 65 : targetPos.y - 40 }}
    transition={{ type: "spring", stiffness: 100, damping: 12 }}
    style={{ position: 'absolute', fontSize: '40px', zIndex: 100, pointerEvents: 'none', filter: 'drop-shadow(0 0 10px #bc13fe)' }}
  >
    👾
  </Motion.div>
);

export default function App() {
  const [_TREE, _SET_TREE] = useState(null);
  const [inputValue, setInputValue] = useState('');
  
  // Dynamic Center Calculation
  const getCenterX = () => (window.innerWidth - 320) / 2;
  
  const [heroPos, setHeroPos] = useState({ x: getCenterX(), y: 80 });
  const [isJumping, setIsJumping] = useState(false);
  const [status, setStatus] = useState('SYSTEM_READY');

  /**
   * WALKING LOGIC: The key to stopping the "bounce"
   */
  const walkPath = async (value) => {
    let current = _TREE;
    let path = [{ x: getCenterX(), y: 80 }];

    // Trace the path through the existing tree
    while (current) {
      path.push({ x: current.x, y: current.y });
      if (value < current.value) current = current.left;
      else if (value > current.value) current = current.right;
      else break;
    }

    // Character walks the path step-by-step
    for (const pos of path) {
      setHeroPos(pos);
      await new Promise(r => setTimeout(r, 450)); 
    }
    return current;
  };

  const handleInsert = async (e) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    setStatus(`SCANNING_PATH_FOR_${val}...`);
    setInputValue('');

    // 1. Character walks to the destination BEFORE tree updates
    await walkPath(val);

    // 2. Update logic happens AFTER the walk
    const newTree = _TREE ? JSON.parse(JSON.stringify(_TREE)) : null;
    const updatedTree = insertNode(newTree, val);
    calculatePositions(updatedTree, getCenterX(), 80, 200);

    // 3. Tree updates, and character jumps!
    _SET_TREE(updatedTree);
    setStatus(`NODE_${val}_STABILIZED`);
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 400);
  };

  // FIXED: handleReset is now defined inside the component
  const handleReset = () => {
    _SET_TREE(null);
    setHeroPos({ x: getCenterX(), y: 80 });
    setStatus('MEMORY_PURGED // SYSTEM_REBOOTED');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>KINETIC_TREE_V1.0</h1>
        <div className="status-bar">{status}</div>
      </header>

      <div className="main-layout">
        <main className="visualizer-container">
          <div className="control-panel">
            <form onSubmit={handleInsert}>
              <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="DATA_ID" />
              <button type="submit">INSERT</button>
            </form>
          </div>

          <HeroCharacter targetPos={heroPos} isJumping={isJumping} />

          <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {getConnections(_TREE).map((conn, i) => (
              <Motion.line 
                key={i} 
                animate={{ x1: conn.from.x + 20, y1: conn.from.y + 20, x2: conn.to.x + 20, y2: conn.to.y + 20 }} 
                stroke="#bc13fe" 
                strokeWidth="2" 
                strokeOpacity="0.4" 
              />
            ))}
          </svg>

          <AnimatePresence>
            {flattenTree(_TREE).map((node) => (
              <Motion.div 
                key={node.id} 
                initial={{ scale: 0, opacity: 0 }} 
                animate={{ x: node.x, y: node.y, scale: 1, opacity: 1 }} 
                exit={{ scale: 0, opacity: 0 }}
                className="node-box"
                style={{ position: 'absolute', width: '40px', height: '40px', border: '1px solid #00f3ff', background: 'rgba(0,243,255,0.05)', color: '#00f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}
              >
                {node.value}
              </Motion.div>
            ))}
          </AnimatePresence>
        </main>

        <aside className="sidebar">
          <div>
            <div className="intel-title">SYSTEM_OVERVIEW</div>
            <p className="intel-text">KineticTree bridges the gap between abstract algorithms and kinetic motion design.</p>
            
            <div className="intel-title">TECH_STACK</div>
            <div style={{ marginBottom: '15px' }}>
              <span className="tech-tag">React.js</span>
              <span className="tech-tag">Framer Motion</span>
              <span className="tech-tag">SVG_Render</span>
            </div>

            <div className="intel-title">ALGORITHM_STATS</div>
            <p className="intel-text">
              <strong>STRUCTURE:</strong> BST<br/>
              <strong>COMPLEXITY:</strong> O(log n)
            </p>
          </div>
          
          <button className="reboot-btn" onClick={handleReset}>REBOOT_SYSTEM</button>
        </aside>
      </div>

      <footer className="footer">
        DEVELOPER: Cynthia Nwume // STATUS: ONLINE // SECTOR: 7G
      </footer>
    </div>
  );
}