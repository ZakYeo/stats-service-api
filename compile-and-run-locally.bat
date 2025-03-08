@echo off
setlocal
echo Starting Docker Compose...
docker-compose up -d

:: Wait for PostgreSQL to be ready
echo Waiting for PostgreSQL to start...
timeout /t 5

echo Running Prisma Migrations...
call npx prisma migrate deploy

echo Seeding Database...
call npx prisma db seed

echo Building TypeScript project...
call npm run build

echo Building AWS SAM application...
call sam build --template local-template.yaml

echo Starting AWS SAM local API (Press Ctrl+C to stop)...
call sam local start-api --docker-network local-dev-network --template local-template.yaml

endlocal
