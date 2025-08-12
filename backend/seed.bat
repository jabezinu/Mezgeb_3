@echo off
setlocal

REM Read the .env.example file and set the environment variables
for /f "tokens=1* delims==" %%a in (.env.example) do (
    if not "%%a"=="" if not "%%a"=="#" (
        set "%%a=%%b"
    )
)

REM Run the seed script with the environment variables
node seed.js

endlocal
