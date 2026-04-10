# AI-Powered Blockchain Analytics & Smart Dashboard Platform

Enterprise-grade, real-time intelligence dashboard integrating AI-driven forecasting with Solana blockchain integrity verification.

## 🚀 Overview

A full-stack AI + Web3 platform that provides real-time business analytics, predictive insights, and blockchain integration using Solana.

## ✨ Key Features

- **Secure Admin Authentication**: JWT-based with administrative RBAC and bcrypt hashing.
- **Real-time Analytics Dashboard**: High-fidelity visualizations with Lucide React and Framer Motion.
- **AI Sales Forecasting**: Predictive insights and anomaly detection via a custom microservice.
- **Solana Integration**: Phantom wallet connectivity and on-chain data anchoring for tamper-proof records.
- **CSV Data Pipeline**: Efficient processing and verification of uploaded datasets.

## 🏗️ Architecture

This project is structured as a monorepo containing the following core services:

- **`/frontend`**: React (Vite) dashboard.
- **`/backend`**: Node.js/Express API (the neural core).
- **`/blockchain`**: Solana smart contracts and scripts.
- **`/ai-service`**: Python-based AI microservice.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Zustand.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Blockchain**: Solana, Anchor, Web3.js, Rust.
- **AI/ML**: Python, Pandas, FastAPI.

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
