@echo off
python -m pip install -r requirements.txt
python icon_gen.py
python -m uvicorn main:app --host 127.0.0.1 --port 8000