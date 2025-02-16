@echo off
setlocal
echo Starting Docker Compose...
docker-compose up -d

echo Building TypeScript project...
call npm run build

echo Building AWS SAM application...
call sam build

echo Starting AWS SAM local API (Press Ctrl+C to stop)...
call sam local start-api --docker-network local-dev-network

endlocal
