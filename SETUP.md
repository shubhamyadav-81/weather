# Quick Setup Guide

Follow these simple steps to get your weather app running:

## Step 1: Get Your Free API Key

1. Go to https://openweathermap.org/api
2. Click "Sign Up" and create a free account
3. After signing up, go to the "API keys" section
4. Copy your API key (it will look like: `abc123def456ghi789...`)

**Note:** This app uses the One Call API 3.0 by default (requires subscription). It will automatically fall back to the free One Call API 2.5 if your API key doesn't have access to 3.0. For basic features, the free tier works perfectly!

## Step 2: Add Your API Key

1. Open `script.js` in a text editor
2. Find this line (line 4):
   ```javascript
   let WEATHER_API_KEY = 'demo';
   ```
3. Replace `'demo'` with your actual API key:
   ```javascript
   let WEATHER_API_KEY = 'abc123def456ghi789';  // Your actual key here
   ```
4. Save the file

## Step 3: Open the Website

Simply double-click `index.html` to open it in your browser!

**Or use a local server (recommended):**

### Using Python:
```bash
python -m http.server 8000
```
Then open http://localhost:8000

### Using VS Code:
1. Install the "Live Server" extension
2. Right-click `index.html`
3. Click "Open with Live Server"

## Step 4: Search for Weather!

1. Type a city name in the search bar
2. Press Enter or click the search button
3. Explore the weather data!

## Features Available

✅ Current weather conditions  
✅ 8-day forecast  
✅ Hourly forecast with graphs  
✅ Real-time AQI (Air Quality Index)  
✅ Interactive map  
✅ Conditions dashboard  
✅ World cities forecast  

## Troubleshooting

**"API Key Required" message appears:**
- Make sure you've added your API key to `script.js`
- Verify the API key is correct (no extra spaces)
- Wait a few minutes if you just created the account (API keys need to activate)

**Map not showing:**
- Check your internet connection
- Open browser console (F12) for any errors

**Weather data not loading:**
- Verify your API key is working at: https://openweathermap.org/api
- Check browser console for errors
- Make sure you're connected to the internet

## Need Help?

- Check the main README.md file for detailed information
- Visit https://openweathermap.org/help for API documentation
- Make sure you're using the latest version of a modern browser

---

**Enjoy your weather app! 🌤️**

