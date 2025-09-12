#!/bin/bash

echo "Setting up Learn Live application..."

# Install client dependencies
echo "Installing client dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server && npm install
cd ..

echo "Setup completed successfully!"
echo "Run 'npm run dev:all' to start both client and server"
