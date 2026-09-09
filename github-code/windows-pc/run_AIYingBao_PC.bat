@echo off
setlocal
cd /d "%~dp0"

if exist "D:\ProgramData\anaconda3\python.exe" (
  "D:\ProgramData\anaconda3\python.exe" "AIYingBao_PC.py"
) else (
  python "AIYingBao_PC.py"
)

endlocal
