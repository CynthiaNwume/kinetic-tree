/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import './App.css';

/**
 * --- BST LOGIC (OUTSIDE COMPONENT) ---
 */

// Inserts a new value into the tree recursively
const insertNode = (node, value) => {
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
  if (value < node.value) {
    node.left = insertNode(node.left, value);
  } else if (value > node.value) {
    node.right = insertNode(node.right, value);
  }
  return node;
};

// Calculates coordinates. Uses 'depth' to pull the tree UP as it grows.
const calculatePositions = (node, x, y, spacing, depth = 0) => {
  if (!node) return;

  // LIFT LOGIC: As depth increases, we subtract from Y to shift the tree upward.
  const verticalOffset = y - (depth * 25); 
  
  node.x = x;
  node.y = verticalOffset;

  calculatePositions(node.left, x - spacing, y + 80, spacing / 1.6, depth + 1);
  calculatePositions(node.right, x + spacing, y + 80, spacing / 1.6, depth + 1);
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

/**
 * --- MAIN COMPONENT ---
 */
export default function App() {
  // 1. STATE INITIALIZATION
  const [_TREE, _SET_TREE] = useState(null);
  const [nickname, setNickname] = useState('');
  const [isEntryDone, setIsEntryDone] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(localStorage.getItem('bst_high_score') || 0);
  const [status, setStatus] = useState('SYSTEM_IDLE');
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizValue, setQuizValue] = useState(null);
  const [isGlitched, setIsGlitched] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  const getCenterX = () => (window.innerWidth - 320) / 2;
  const [heroPos, setHeroPos] = useState({ x: getCenterX(), y: 80 });

  /**
   * 2. RESET LOGIC (Hoisted high)
   */
  const handleReset = () => {
    _SET_TREE(null);
    setLives(5);
    setScore(0);
    setIsQuizMode(false);
    setHeroPos({ x: getCenterX(), y: 80 });
    setStatus('SYSTEM_REBOOTED // MEMORY_PURGED');
  };

  /**
   * 3. LIFECYCLE EFFECTS
   */
  useEffect(() => {
    const name = prompt("IDENTIFY YOURSELF, OPERATOR:");
    setNickname(name || 'GUEST_USER');
    setIsEntryDone(true);
  }, []);

  useEffect(() => {
    if (lives <= 0) {
      setStatus(`CRITICAL_ERROR: ${nickname} EXPIRED. REBOOTING...`);
      setTimeout(() => handleReset(), 3000);
    }
  }, [lives, nickname]);

  /**
   * 4. ANIMATION & GAMEPLAY
   */
  const walkPath = async (value) => {
    let current = _TREE;
    let path = [{ x: getCenterX(), y: 80 }];
    while (current) {
      path.push({ x: current.x, y: current.y });
      if (value < current.value) current = current.left;
      else if (value > current.value) current = current.right;
      else break;
    }
    for (const pos of path) {
      setHeroPos(pos);
      await new Promise(r => setTimeout(r, 450));
    }
  };

  const handleInsert = async (e) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    const nodeCount = flattenTree(_TREE).length;
    if (nodeCount >= 6 && !isQuizMode) {
      setIsQuizMode(true);
      setQuizValue(val);
      setStatus(`CHALLENGE: ${nickname}, WHERE DOES ${val} GO?`);
      return;
    }
    await executeRealInsert(val);
  };

  const executeRealInsert = async (val) => {
    await walkPath(val);
    const newTree = _TREE ? JSON.parse(JSON.stringify(_TREE)) : null;
    const updatedTree = insertNode(newTree, val);
    calculatePositions(updatedTree, getCenterX(), 80, 200);
    _SET_TREE(updatedTree);
    setStatus(`DATA_STABILIZED. WELL DONE, ${nickname}.`);
    setInputValue('');
  };

  const handleQuizAnswer = async (direction) => {
    let correctDir = quizValue < _TREE.value ? 'left' : 'right';
    if (direction === correctDir) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore * 100 > highScore) {
        setHighScore(newScore * 100);
        localStorage.setItem('bst_high_score', newScore * 100);
      }
      setStatus(`CRITICAL_HIT! +100XP`);
      setIsJumping(true); 
      setTimeout(() => setIsJumping(false), 500);
    } else {
      setLives(l => l - 1);
      setIsGlitched(true); 
      setStatus(`SYSTEM_COMPROMISED: -1 LIFE`);
      setTimeout(() => setIsGlitched(false), 600);
    }
    setIsQuizMode(false);
    await executeRealInsert(quizValue);
  };

  if (!isEntryDone) return <div className="loading">INITIALIZING...</div>;

  return (
    <div className={`app-container ${isGlitched ? 'glitch-active' : ''}`}>
      <header className="header">
        <div className="user-profile" style={{paddingTop: '10px'}}>
          <span>OPERATOR: {nickname} </span>
          <span>LIVES: {"❤️".repeat(lives)} </span>
          <span>XP: {score * 100} (BEST: {highScore})</span>
        </div>
        <div className="status-bar">{status}</div>
      </header>

      <div className="main-layout">
        <main className="visualizer-container">
          {!isQuizMode ? (
            <div className="control-panel">
              <form onSubmit={handleInsert}>
                <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="DATA_ID..." />
                <button type="submit">INSERT</button>
              </form>
            </div>
          ) : (
            <div className="quiz-panel" style={{position: 'absolute', top: '20px', left: '20px', zIndex: 60, background: 'rgba(0,0,0,0.8)', padding: '15px', border: '1px solid #bc13fe'}}>
              <h3 style={{fontSize: '12px', color: '#bc13fe'}}>GO LEFT OR RIGHT?</h3>
              <button onClick={() => handleQuizAnswer('left')}>LEFT</button>
              <button onClick={() => handleQuizAnswer('right')}>RIGHT</button>
            </div>
          )}

          <Motion.div animate={{ x: heroPos.x, y: isJumping ? heroPos.y - 70 : heroPos.y - 40 }} className="hero" style={{position: 'absolute', fontSize: '30px', zIndex: 100}}>
            👾
          </Motion.div>

          {/* SVG BRANCHES: centered with +23 offset */}
          <svg className="tree-svg">
            {getConnections(_TREE).map((conn, i) => (
              <Motion.line 
                key={i} 
                animate={{ x1: conn.from.x + 23, y1: conn.from.y + 23, x2: conn.to.x + 23, y2: conn.to.y + 23 }} 
                stroke="#bc13fe" strokeWidth="2" strokeOpacity="0.4" 
              />
            ))}
          </svg>

          {flattenTree(_TREE).map((node) => (
            <Motion.div key={node.id} animate={{ x: node.x, y: node.y }} className="node-box">
              {node.value}
            </Motion.div>
          ))}
        </main>

        <aside className="sidebar">
          <div className="intel-section">
            <div className="intel-title">MISSION_LOG</div>
            <p className="intel-text">Welcome, {nickname}. Organize the data stream using BST logic. Predict placement to maintain integrity.</p>
          </div>
          <div className="intel-section">
            <div className="intel-title">TECH_STACK</div>
            <ul className="tech-list">
              <li><span>FRONTEND:</span> React 18</li>
              <li><span>MOTION:</span> Framer Motion</li>
              <li><span>STYLING:</span> Custom CSS3</li>
              <li><span>LOGIC:</span> Recursive BST</li>
            </ul>
          </div>
          <div className="intel-section">
            <div className="intel-title">ALGORITHM_STATS</div>
            <p className="intel-text">O(log n) Search Efficiency Active.</p>
          </div>
          <button className="reboot-btn" onClick={handleReset}>FORCE_REBOOT</button>
        </aside>
      </div>
      <footer className="footer">DEVELOPER: Cynthia Nwume // STATUS: ONLINE // SECTOR: 7G</footer>
    </div>
  );
}