@echo off
set action=%1

if "%action%"=="flash" (
  echo Flashing firmware...
  adb reboot bootloader
  fastboot flash all
  echo Flash complete.
)

if "%action%"=="frp" (
  echo Running FRP unlock...
  adb shell am start -n com.google.android.gsf.login/
  adb shell pm clear com.google.android.gsf.login
  echo FRP unlock complete.
)
