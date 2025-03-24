# DBWay Development Mode - Improved

This document explains how to use the improved development mode feature to test your DBWay scripts locally before pushing them to GitHub.

## Setup

1. Make sure you have the Live Server extension installed in VSCode

   - If not, install it from the Extensions marketplace (search for "Live Server" by Ritwick Dey)

2. Open your DBWay project folder in VSCode

3. Start the Live Server by clicking on "Go Live" in the status bar at the bottom of VSCode

   - This will typically start a server at http://localhost:5500

4. Make sure all your script files (load.js, tabs.js, functions.js, controls.js) are in the root directory of your project

## Using Development Mode in Webflow

Simply add the `devMode="true"` attribute to your script tag:

```html
<script devMode="true" src="https://danwebflow.github.io/dbway-dev/load.js"></script>
```

That's it! No additional scripts or configuration needed.

## Improvements in This Version

1. **More Reliable Local Server Detection**

   - Uses multiple methods to detect if your local server is running
   - Provides detailed console logging for troubleshooting

2. **Cache-Busting for Local Development**

   - Automatically adds timestamps to local script URLs to prevent caching
   - Ensures you always see the latest version of your scripts

3. **Automatic Fallback to Remote Scripts**

   - If a local script fails to load, it will automatically try the remote version
   - Provides seamless fallback without breaking functionality

4. **Enhanced Console Logging**
   - Detailed logs for each step of the script loading process
   - Makes it easier to diagnose and fix issues

## How It Works

1. When the `devMode="true"` attribute is detected, the script will:

   - Try to connect to your local development server (http://localhost:5500 by default)
   - If successful, it will load all scripts from your local server with cache-busting
   - If unsuccessful, it will fall back to loading scripts from GitHub
   - If a local script fails to load, it will automatically try the remote version as a fallback

2. You'll see a "DBWay Dev Mode" indicator in the bottom-right corner of your page when development mode is active

3. Check the browser console for detailed messages about script loading and environment detection

## Customizing the Local Server Configuration

If you're using a different port or host for your local server, you can modify the configuration in the `load.js` file:

```javascript
const localDevConfig = {
  port: 5500, // Change this to match your Live Server port
  host: "localhost",
  protocol: "http",
};
```

## Troubleshooting

1. Make sure your Live Server is running before loading the Webflow page

   - Check that the server is running by opening http://localhost:5500/ directly in your browser

2. Check the browser console for detailed messages

   - The script now provides extensive logging to help diagnose issues

3. If scripts aren't loading from your local server:

   - Verify the port number matches your Live Server port
   - Make sure all script files are in the root directory of your project
   - Try opening http://localhost:5500/load.js directly in your browser to ensure it's accessible
   - Check for any CORS issues in the browser console

4. Clear your browser cache

   - The script includes cache-busting for local development, but clearing your cache can help resolve persistent issues

5. Try using an incognito/private browsing window
   - This can help rule out browser extension interference

## Disabling Development Mode

To disable development mode and use the production scripts from GitHub, simply remove the `devMode` attribute:

```html
<script src="https://danwebflow.github.io/dbway-dev/load.js"></script>
```
