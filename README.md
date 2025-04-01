# My Demo App

## Disclaimer

This is a fork of the [original my-demo-app](https://github.com/ben3101/CommunitySolidServer) used in the VC-based authentication protocol for Solid. It has been modified to work with the mobile wallet app using QR codes and WebSockets.

## Usage

To start the app, run:

`npm install`

Followed by:

`npm run build`

Followed by:

`npm run start`

The app should start on http://localhost:8080

Fill in your DID and the local IP address of your computer (this can be found with ipconfig on Windows and ip a on Linux).

Make a request to a Pod resource. You should get a VP request in return. You should also see a QR code. You must scan this with the wallet application to send a VP to the app.

Once a VP is recieved, the app will make another request for the resource with the VP. If the server successfully validates the VP, it will return the resource to the app, which will display it in the textarea for you to see.
