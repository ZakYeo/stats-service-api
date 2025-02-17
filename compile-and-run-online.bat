@echo off
setlocal

echo Building TypeScript project...
call npm run build

echo Building AWS SAM application...
call sam build --template online-template.yaml

call sam deploy --guided --template online-template.yaml

endlocal
