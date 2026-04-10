# AI-Powered Blockchain Analytics Platform

An enterprise-grade, real-time intelligence dashboard integrating AI-driven forecasting with Solana blockchain integrity verification.

## 🚀 Architecture Overview

This project is structured as a monorepo containing the following core services:

- **`/frontend`**: React (Vite) dashboard with high-fidelity visualizations, Framer Motion animations, and Phantom wallet integration.
- **`/backend`**: Node.js/Express API serving as the neural core, managing user sessions (JWT), and orchestrating data flows.
- **`/blockchain`**: Solana smart contracts (programs) and scripts for on-chain data anchoring and integrity proofing.
- **`/ai-service`**: Python-based AI microservice for advanced time-series forecasting, anomaly detection, and risk profiling.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React, Framer Motion, Zustand.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT.
- **Blockchain**: Solana, Anchor, Web3.js, Rust.
- **AI/ML**: Python, Pandas, Scikit-learn, FastAPI.

## 📋 Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB (Running locally or via Atlas)
- Solana Tool Suite (for blockchain development)
- Phantom Wallet Extension

## 🚦 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Configure your .env
npm run dev
```

### 3. AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 🔒 Security

This platform implements production-grade security:
- JWT-based authentication with administrative RBAC.
- Bcrypt password hashing.
- On-chain integrity verification for all datasets.
- Strict environment variable management (excluded from version control).

---
*Created with focus on Zero-Leak security and enterprise scalability.*
