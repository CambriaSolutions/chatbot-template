# Cambria Chat Frame

This is a WordPress plugin for Cambria Solutions' chat frame.

## Description

This includes Cambria’s chat frame as a react app.
Inside the `public/app/src` folder you can customize the colors,
title, activation preferences, and the destination of the bot itself.

## Prerequisites

To run locally, install WordPress and serve using MAMP for mac
or XAMPP for PC.

- [Mac](https://codex.wordpress.org/Installing_WordPress_Locally_on_Your_Mac_With_MAMP)
- [PC](https://codex.wordpress.org/Test_Driving_WordPress#Installing_WordPress_on_Your_Windows_Desktop)

## Prior to Installation to WordPress site

1. Create .env file with the following

- `GOOGLE_MAPS_KEY=your_google_maps_api_key` for geolocation
- `GENERATE_SOURCEMAP=false` to exclude source map from being created

2. Ensure all required props are populated with desired values

```
<ChatWindow
    primaryColor="#3bafbf"
    secondaryColor="#000"
    headerColor="#3bafbf"
    title="Chat Title"
    client="Dialogflow"
    clientOptions={options}
    fullscreen={false}
    initialActive={false}
    policyText={privacyPolicy}
    mapConfig={mapConfig}
    feedbackUrl={feedbackUrl}
    activationText={activationText}
  />
```

- `primaryColor` can be any hex or material-ui color (e.g. 'blue', 'red', 'yellow', 'cyan')
- `secondaryColor` can be any hex or material-ui color (e.g. 'blue', 'red', 'yellow', 'cyan')
- `headerColor` can be any hex or material-ui color (e.g. 'blue', 'red', 'yellow', 'cyan')
- `title` can be any string
- `client` can only currently be 'Dialogflow'
- `clientOptions` is an object containing URLs for fulfillment APIs:

```
{
eventUrl: 'https://[your_project].cloudfunctions.net/eventRequest',
textUrl: 'https://[your_project].cloudfunctions.net/textRequest',
}
```

- `fullscreen` is whether or not the window is currently fullscreen
- `initialActive` describes whether or not the window is open and active on page load
- `policyText` can be any string
- `mapConfig` an object containing a google maps key and center coordinates

```

```

- `feedbackUrl` a URL string of the endpoint to send feedback data to analytics

```feedbackUrl =
  'https://us-central1-webchat-analytics.cloudfunctions.net/storeFeedback'
```

- `activationText` a string message to call out action

```activationText = 'Talk to Gen'

```

{
googleMapsKey: process.env.GOOGLE_MAPS_KEY
centerCoordinates: {
lat: latitude,
lng: longitude,
}
}

```

3. Navigate to the `app` directory and install required modules: `yarn` (or `npm install`)
4. Build app `yarn build` (or `npm run build`)
5. Remove `node_modules` folder
6. Zip full directory

## Installation

1. Upload the zipped file to the plugins menu and activate

### Incorporation the chatbot itself

This plugin is designed to work with a [Dialogflow](https://dialogflow.com/docs) agent.
The communication requires two web-hooks, one to communicate with the chat window,
and one to communicate with the agent. Both URI/'s are set in `public/app/src/App.js`
as `dfWebhookOptions`

- `eventUrl` = dialogflow web-hook
- `textUrl` = function to send the user request from our chat frame to the web hook

### Styling the chat frame

The following attributes are customizable in `public/app/src/App.js`

1. `avatar` = the image used as an avatar
2. `primaryColor` = the color of the chat frame itself
3. `secondaryColor` = the color of the suggestion buttons
4. `title` = the name of the chatbot
5. `fullscreen` = boolean specifying if the chat window should be fullscreen on start
6. `initialActive` = boolean specifying if the chat window should open on page load

### Building the chat frame

At its core, the plugin pulls any js files from the `/app/build/static/js/` folder
and injects them to whatever pages we have specified. Any changes to the app folder
require `npm run build` or `yarn run build` to be run in the command line.

To exclude map files from being generated, create a .env file in the root directory
with `GENERATE_SOURCEMAP=false`

### Specifying pages for the window to live

Our window is conditionally loaded on pages that we have "white-listed".
These can be modified in the `white-listed-pages.php` file in
the `$acceptedPathArray` array.

## How it Works

At its simplest, a WordPress plugin is a PHP file with a plugin header
comment. A plugin enables us to extend WordPress functionality without touching
the WordPress core. The process of a WordPress plugin is as follows:

1. WordPress scans its `/wp-content/plugins` directory for PHP files with a [plugin
   file header](https://codex.wordpress.org/File_Header). Wordpress then registers the activation and deactivation hooks
   for the plugin and the plugin will show up in the ‘Plugins’ menu in WordPress.

2. On activation, plugins can run a routine to add rewrite rules, add custom
   database tables, or set default option values.

   Our plugin requires none of these abilities and is simply created via the
   `register_activation_hook( __FILE__, 'activate_cambria_chatframe' );`
   hook. This activates our plugin, who's primary purpose is to conditionally
   insert our js files to specified pages.

3. As the page is loaded, WordPress checks to see if any plugins are active,
   if so, instantiate the logic supplied by the plugin files.

4. Our plugin fires the `wp_footer` action and creates a div with the id of
   "root" right before the closing `</body>` tag.

5. Then our plugin fires the `wp_enqueue_scripts`, which enqueues items that
   are meant to appear on the front end.

6. The plugin then checks to see if the current page contains part of our array of
   white-listed pages. These can be modified in the
   `white-listed-pages.php` file in the `$acceptedPathArray` array.

7. If the current page is part of the array, our plugin scans the `/app/build/static/js/`
   folder, and calls `wp_enqueue_script` for each which registers and enqueues the included js files.

8. Notice in our call of `wp_enqueue_script`:
   `wp_enqueue_script($filename, $react_js_to_load, array(), $this->version, true)`
   We set the final argument `true` is short form for `$in_footer = true`,
   so that the scripts are enqueued before `</body>` instead of in the `<head>`.

   Without this specification, our window will not populate because our js files
   depend on the div with the id "cambria-wordpress-chatframe", which occurs just before our scripts are loaded.

9. Our compiled js creates the chatframe, and populates the div mentioned
   earlier.
```
