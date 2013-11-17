@echo off
start mongoose.exe -listening_ports 12345 -document_root .
start http://localhost:12345