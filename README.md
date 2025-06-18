# Runway Video Webapp

This project is a simple Node.js web application that communicates with the Runway Gen‑4 Video API. It lets you generate videos from any image URL via a browser based interface.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the web server

   ```bash
   npm start
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

You will be prompted to enter your Runway API key along with the image URL and prompt text. Generated videos are stored in your browser's local storage so they will appear again when you refresh the page.

## Obtaining a Runway API Key

To use the video generation features you will need a [Runway API account](https://dev.runwayml.com/), key and credits. Follow the [Runway API Quickstart](https://docs.dev.runwayml.com/guides/using-the-api/) guide.

## Learn More

- [Runway API Documentation](https://docs.dev.runwayml.com/)
