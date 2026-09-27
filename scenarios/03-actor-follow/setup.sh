#!/bin/bash
set -e

echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
(cd backend && npm install)

echo "Installing frontend dependencies..."
(cd frontend && npm install)

echo "Preparing the in-memory MongoDB (the first run downloads the binary, about 100 MB)..."
(cd backend && node devtools/memory-db.js --check)

echo "Setup complete!"
echo "To start the application, run: npm start"
