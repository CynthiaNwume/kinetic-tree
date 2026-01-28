# 👾 KineticTree V1.0

**KineticTree** is an interactive, gaming-inspired Binary Search Tree (BST) visualizer. It bridges the gap between abstract data structure logic and engaging UI/UX by using asynchronous animations to "walk" through the tree-building process.



---

## 🚀 Overview

Most data structure visualizers are static or clinical. **KineticTree** turns learning into an experience. When a user inserts a value, a scout sprite (👾) performs a real-time traversal of the tree, following the path the logic takes before the data "stabilizes" into a new node.

### Core Features:
* **Asynchronous Pathfinding:** Watch the algorithm's decision-making process step-by-step.
* **Dynamic Coordinate Mapping:** Custom recursive math ensures nodes never overlap, regardless of tree depth.
* **Gaming Interface:** Cyberpunk/Synthwave aesthetic with neon glows, scanlines, and a live "System Log."
* **Technical Sidebar:** Live insights into the BST algorithm, time complexity, and the active tech stack.

---

## 🧠 The Logic: Binary Search Tree (BST)

A Binary Search Tree is a node-based binary tree data structure which has the following properties:
* The **Left Subtree** of a node contains only nodes with keys lesser than the node’s key.
* The **Right Subtree** of a node contains only nodes with keys greater than the node’s key.
* The left and right subtree each must also be a binary search tree.

### Complexity Stats:
| Property | Average Case | Worst Case |
| :--- | :--- | :--- |
| **Search / Insertion** | O(log n) | O(n) |
| **Space Complexity** | O(n) | O(n) |

---

## 🛠️ Tech Stack

This project was built to demonstrate proficiency in modern React development and motion design:

* **React.js (v18):** Utilizing functional components and advanced Hooks (`useState`, `useRef`, `AnimatePresence`).
* **Framer Motion:** Powering the kinetic physics and the "Victory Jump" spring animations.
* **SVG Render:** Dynamic calculation of parent-to-child connections (edges) using real-time coordinate tracking.
* **JavaScript (ES6+):** Deep recursive logic for tree traversal and coordinate offset calculation.
* **CSS3:** Custom neon-themed styling without the use of external UI libraries like Tailwind.

---

## 📂 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/CynthiaNwume/kinetictree.git](https://github.com/CynthiaNwumekinetictree.git)
Install dependencies:

Bash
cd kinetictree
npm install
Start the development server:

Bash
npm run dev
## 👤 Developer: Cynthia Nwume Programming Graduate | Sheridan College

## Turning abstract logic into kinetic experiences.