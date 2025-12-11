#!/usr/bin/env bash
# 讓 gunicorn 運行您的 Flask 應用程式。
# 假設您的 Flask 應用實例變數名是 'app' (在 app.py 內)
gunicorn --bind 0.0.0.0:10000 app:app