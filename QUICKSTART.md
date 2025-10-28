# Quick Start - How to Run the Weather App

## The Easiest Way

### Option 1: Double-Click (Simplest!)
1. Find the file `index.html` in the weather folder
2. Double-click it
3. Your browser will open and show the app!

**Note:** You'll see "API Key Required" message. To get weather data working:

### Option 2: Using a Local Server (Recommended)

**With Python (if you have it installed):**
```bash
# Open terminal/command prompt in the weather folder
python -m http.server 8000

# Then open: http://localhost:8000
```

**With Node.js (if you have it installed):**
```bash
# Install http-server globally (one time only)
npm install -g http-server

# Run the server
http-server

# Then open: http://localhost:8080
```

**With VS Code:**
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Get Your API Key to See Real Data

Currently the app shows "API Key Required" because it needs an API key to fetch real weather data.

### To Get Real Weather Data:

1. **Get a free API key:**
   - Visit: https://openweathermap.org/api
   - Click "Sign Up" and create an account
   - Go to "API keys" section
   - Copy your API key

2. **Add the API key:**
   - Open `script.js` in any text editor
   - Find line 4: `let WEATHER_API_KEY = 'demo';`
   - Replace `'demo'` with your actual API key:
     ```javascript
     let WEATHER_API_KEY = 'your_actual_api_key_here';
     ```
   - Save the file

3. **Refresh the browser**
   - The weather data will now load!

## What You'll See

Once you have an API key configured:

✅ **Default Location:** Mumbai, India (shows automatically)
✅ **Search Bar:** Type any city name or zip code
✅ **Current Weather:** Temperature, conditions, RealFeel®
✅ **8-Day Forecast:** Daily weather predictions
✅ **Hourly Forecast:** Detailed hourly breakdown
✅ **Conditions Tab:** AQI, UV Index, Humidity, Pressure
✅ **Map Tab:** Interactive map showing location
✅ **World Cities:** 16 major cities around the world

## Troubleshooting

**"API Key Required" message:**
- You need to add your OpenWeatherMap API key to `script.js`
- Get one for free at: https://openweathermap.org/api

**Nothing happens when searching:**
- Make sure you have an active internet connection
- Check that your API key is correct in `script.js`
- Open browser console (F12) to see any errors

**Website looks broken:**
- Make sure all files are in the same folder:
  - index.html
  - styles.css
  - script.js
- Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)

## File Location

You should have these files in your weather folder:
```
weather/
├── index.html
├── styles.css
├── script.js
├── README.md
├── SETUP.md
└── QUICKSTART.md (this file)
```

## Need More Help?

- Check `SETUP.md` for detailed setup instructions
- Check `README.md` for complete documentation
- Visit https://openweathermap.org/help for API help

---

**Enjoy your weather app! 🌤️**


