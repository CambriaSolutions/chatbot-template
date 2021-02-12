# MDHS Customer Service Automation (CSA)

Customer service automation project for MDHS. The two main components of this project are the functions that power the [Dialogflow Agent](https://dialogflow.com/docs), and the test user interface.

## Deployment Instructions

1. Set up a Firebase project (Google Cloud Platform)
2. Upgrade Firebase project to the Blaze (pay as you go) tier
3. Set up a project repository
4. Install firebase-tools CLI with `npm i -g firebase-tools`
5. Login to Firebase CLI with `firebase login`
6. Select Firebase project or create a new one
7. Install dependencies for functions and interface using `yarn` or `npm install`
8. Set environment variables for functions and interface
9. Deploy the project with one of the scripts below

### Scripts for functions

`deploy`: deploy functions to firebase for the default project  
`deploy-dev`: deploy only functions for the development project  
`deploy-dev-beta`: deploy only functions for the second development project  
`deploy-stage`: deploy only functions for the staging project  
`deploy-dev-dialogflow`: deploy only the dialogflow webhook function to the dev project  
`deploy-dev-beta-dialogflow`: deploy only the dialogflow webhook function to the second development project  
`deploy-stage-dialogflow`: deploy only the dialogflow webhook function to the staging project  
`deploy-prod`: deploy all functions for the production project

### Scripts for interface

`"deploy-dev`: deploys the ui for the dev project
`"deploy-stage`: deploys the ui for the staging environment
`"deploy-prod`: deploys the ui for the production environment

### Firebase commands

`firebase deploy`: creates a release for all deployable resources  
`--only hosting`: deploys only the files for the hosted ui  
`--project dev`: targets the deployment to the development project  
`--project dev-beta`: targets the deployment to the second development project  
`--project stage`: targets the deployment to the staging project  
`--project prod`: targets the deployment to the production project

The commands are run in the same line via cli. For example `deploy-dev-search`  
contains the following script: `firebase deploy --only hosting:search --project development`

## Development and production environments

Firebase requires separate projects to [host multiple environments](https://firebase.google.com/docs/projects/multiprojects) for the interface and functions.

To manually switch between the two, use the command `firebase use -P *environment*`.

## Files to update prior to deployment

#### Functions

`.env`

```
GOOGLE_MAPS_KEY=xxxxxxxxxxxxxxx
SERVICE_DESK_KEY=xxxxxxxxxxxxxxx
SERVICE_DESK_URI=https://[service-desk-project]/rest/servicedeskapi/request
SERVICE_DESK_ID=xx
REQUEST_TYPE_ID=x
```

#### Interface

`.env`

```
REACT_APP_GOOGLE_MAPS_KEY=xxxxxxxxxxxxxxx
```

## Geocode script

We use [Google's Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro) to extract the coordinates needed to populate the map response
with pins of locations. The Geocoding API request has two required parameters.

address - the street address we want to geocode
key - the application's API [key](https://developers.google.com/maps/documentation/geocoding/get-api-key)

1. Ensure the .env file has a valid [Geocoding API](https://developers.google.com/maps/documentation/geocoding/intro) key.
   `GOOGLE_MAPS_KEY=apikey`
2. Inside of the `retrieveCoordinates.js` file, populate the `locations` variable with and array of addresses.
3. This script is set to run on deployment to firebase functions

## Chatframe Props

```
<ChatWindow
    primaryColor="#3bafbf"
    secondaryColor="#000"
    title="Test Chat"
    client="Dialogflow"
    clientOptions={options}
    fullscreen={false}
    initialActive={false}
    policyText={privacyPolicy}
    mapConfig={mapConfig}
    activationText={activationText}
    feedbackUrl={feedbackUrl}
  />
```

- `primaryColor` can be any hex or material-ui color (e.g. 'blue', 'red', 'yellow', 'cyan')
- `secondaryColor` can be any hex or material-ui color (e.g. 'blue', 'red', 'yellow', 'cyan')
- `headerColor` can be any hex or material-ui color (e.g. 'blue', 'red', 'yellow', 'cyan')
- `title` can be any string
- `client` can only currently be 'dialogflow'
- `clientOptions` is an object containing URLs for fulfillment APIs:

```
{
eventUrl: 'https://us-central1-mdhs-csa-ENVIRONMENT.cloudfunctions.net/eventRequest',
textUrl: 'https://us-central1-mdhs-csa-ENVIRONMENT.cloudfunctions.net/textRequest',
}
```

- `fullscreen` is whether or not the window is currently fullscreen
- `initialActive` describes whether or not the window is open and active on page load
- `policyText` can be any string
- `googleMapsKey` a valid [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/tutorial) key, should be stored in a .env file
- `centerCoordinates` is an object containing coordinates for the map payload to center on:

```

{
googleMapsKey: process.env.GOOGLE_MAPS_KEY
centerCoordinates: {
  lat: latitude,
  lng: longitude,
}
}
```

- `feedbackUrl` a URL string of the endpoint to send feedback data to analytics

```feedbackUrl =
  'https://us-central1-webchat-analytics.cloudfunctions.net/storeFeedback'
```

- `activationText` a string message to call out action

```
activationText = 'Talk to Gen'
```

## Deployment from Dev to Stage

### Interface

1. Update chat frame version in testing ui
2. Ensure webhook is changed to staging
3. Build and deploy to stage hosting
   `yarn deploy-stage`

### Functions

1. Ensure .env contains stage credentials
2. Deploy to stage environment
   `yarn deploy-stage-dialogflow`
3. Test!

### Agent

#### In dev agent

1. Ensure all intents and entities have been updated in dev
2. Download dev agent through: project settings -> export and import -> export as zip

#### In stage agent

1. Update stage agent through: project settings -> export and import -> restore from zip
2. Update fulfillment to staging webhook
3. Test!
