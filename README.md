# KRT AI Terminal — Render Deploy Guide

## இது என்ன
Flask + Angel One SmartAPI live market terminal.
- API credentials கொடுத்தா → LIVE data (green dot)
- கொடுக்காட்டி → DEMO mode (gold dot) — site எப்பவும் வேலை செய்யும்

## Render-ல deploy பண்ற steps

### 1. GitHub-ல upload
இந்த folder-ஐ அப்படியே ஒரு GitHub repo-ல push பண்ணுங்க (எல்லா files-ும், folder structure மாறாம).

### 2. Render-ல புது service
- dashboard.render.com → New → **Web Service** (Static Site இல்ல!)
- உங்க GitHub repo-ஐ connect பண்ணுங்க
- Build Command : `pip install -r requirements.txt`
- Start Command : `gunicorn app:app --bind 0.0.0.0:$PORT`
- Plan: Free

### 3. Live data வேணும்னா — Environment Variables
Render → உங்க service → Environment → இந்த 4-ஐ add பண்ணுங்க:

| Key | Value |
|---|---|
| SMARTAPI_KEY | உங்க API key (chat-ல share பண்ணாதீங்க!) |
| SMARTAPI_CLIENT | Angel One client code (eg: A123456) |
| SMARTAPI_PIN | உங்க MPIN |
| SMARTAPI_TOTP | TOTP secret (smartapi.angelone.in/enable-totp-ல கிடைத்த token) |

⚠️ பழைய leak ஆன key-ஐ delete பண்ணி **புது key** create பண்ணி use பண்ணுங்க.

### 4. Deploy → Open URL
Deploy முடிஞ்சதும் URL open பண்ணுங்க. Header-ல:
- 🟢 LIVE · ANGEL ONE = real data
- 🟡 DEMO MODE = credentials இல்ல / market closed / login fail (Logs பாருங்க)

## Notes
- Market hours (9:15–15:30 IST) தான் live ticks நகரும்
- Free Render plan 15 நிமிஷம் idle-னா தூங்கும் — first load slow-ஆ இருக்கும்
- Watchlist மாத்த: `smart_client.py` → WATCHLIST (token = Angel One instrument master file-ல இருக்கு)
- இது educational/personal tool. Public-ஆ calls கொடுத்தா SEBI RA registration கட்டாயம்.
