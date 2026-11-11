@echo off
REM Wrapper for @21st-dev/magic MCP server.
REM Reads API key from TWENTYFIRST_API_KEY env var instead of hardcoding in settings.json.
REM Set the env var once with: setx TWENTYFIRST_API_KEY "your_key_here"
if "%TWENTYFIRST_API_KEY%"=="" (
  echo [21st-magic-wrapper] ERROR: TWENTYFIRST_API_KEY env var is not set. 1>&2
  echo [21st-magic-wrapper] Run: setx TWENTYFIRST_API_KEY "your_key" then restart Claude. 1>&2
  exit /b 1
)
npx -y @21st-dev/magic@latest %TWENTYFIRST_API_KEY%
