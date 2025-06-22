# Look at that - It's a Space Station

Predicts when will ISS and Other Space Stations be visible at user's location

> **Go to** [space-stations-tracker.vercel.app]()

> **Note**: the development and testing history of the core algorithm is in the [previous repository](https://github.com/gopal-lohar/space-station-tracker-old). this repository is a react app around that algorithm i wrote.


**Space Station Tracker** is a web application that helps you spot the International Space Station (ISS) from your location.

Did you know the International Space Station is visible to the naked eye? It appears as a bright, fast-moving star crossing the night sky. However, visibility depends on specific conditions:

- Time of day (typically at dawn or dusk)
- Your location
- Weather conditions
- The ISS's orbital position

The ISS is only visible when sunlight reflects off its surface while the observer is in relative darkness. These visibility windows typically last just a few minutes.

## Project Architecture
The core of the project is the calculations made to predict the passes, it resides in src/lib/core. functions exported from src/lib/core/index.ts runs in web workers using src/hooks/useCoreWorker.ts and with the help of tanstack query.

## Technical Resources

### Orbital Mechanics & TLE Format
- [Demystifying the USSPACECOM Two-Line Element Set Format](https://keeptrack.space/deep-dive/two-line-element-set/) - Comprehensive explanation of TLE format
- [Computers and Satellites](https://celestrak.org/columns/) - Primary resource for orbital calculation mathematics

### APIs
- [NASA's TLE API](http://tle.ivanstanojevic.me/api/tle) - Provides up-to-date TLE data for the ISS
- [Additional NASA APIs](https://api.nasa.gov/) - Other potential data sources for the project (only the previous api is used in this project in the current state)
