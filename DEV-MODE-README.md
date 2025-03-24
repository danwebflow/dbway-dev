# DBWay Development Mode

This document explains how to use the development mode feature to test your DBWay scripts locally before pushing them to GitHub.

## Setup

1. Make sure you have the Live Server extension installed in VSCode

   - If not, install it from the Extensions marketplace (search for "Live Server" by Ritwick Dey)

2. Open your DBWay project folder in VSCode

3. Start the Live Server by clicking on "Go Live" in the status bar at the bottom of VSCode
   - This will typically start a server at http://localhost:5500

## Using Development Mode in Webflow

Simply add the `devMode="true"` attribute to your script tag:

```html
<script devMode="true" src="https://danwebflow.github.io/dbway-dev/load.js"></script>
```

That's it! No additional scripts or configuration needed.

## How It Works

1. When the `devMode="true"` attribute is detected, the script will:

   - Try to connect to your local development server (http://localhost:5500 by default)
   - If successful, it will load all scripts from your local server
   - If unsuccessful, it will fall back to loading scripts from GitHub

2. You'll see a "DBWay Dev Mode" indicator in the bottom-right corner of your page when development mode is active

3. Check the browser console for messages about which environment is being used

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
2. Check the browser console for any error messages
3. If scripts aren't loading from your local server:
   - Verify the port number matches your Live Server port
   - Check for any CORS issues in the browser console
   - Try opening http://localhost:5500/load.js directly in your browser to ensure it's accessible

## Disabling Development Mode

To disable development mode and use the production scripts from GitHub, simply remove the `devMode` attribute:

```html
<script src="https://danwebflow.github.io/dbway-dev/load.js"></script>
```
