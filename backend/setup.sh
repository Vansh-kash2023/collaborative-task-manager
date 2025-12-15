#!/bin/bash

echo "Setting up Collaborative Task Manager Backend..."

if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
fi

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate dev --name init

echo "Setup complete! You can now run 'npm run dev' to start the server."
