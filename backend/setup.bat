@echo off

echo Setting up Collaborative Task Manager Backend...

if not exist .env (
  echo Creating .env file from .env.example...
  copy .env.example .env
)

echo Installing dependencies...
call npm install

echo Generating Prisma client...
call npx prisma generate

echo Running database migrations...
call npx prisma migrate dev --name init

echo Setup complete! You can now run 'npm run dev' to start the server.
pause
