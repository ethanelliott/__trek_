@echo off
echo Starting Server...
cd "C:\MONGO\bin"
start cmd /c mongod --dbpath C:\Users\Ethan\Desktop\node\nodetest1\data
cd C:\Users\Ethan\Desktop\node\nodetest1
nodemon npm start
pause