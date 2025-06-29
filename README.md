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
The core of the project is the calculations made to predict the passes, it resides in `src/lib/core/`. functions exported core runs in web workers using src/hooks/useCoreWorker.ts and with the help of tanstack query.

## Core Ganit
for a satellite in space to be visible to an Observer on ground, it needs to meet a few *conditions*

0. It should be big enough, ISS and Tiangong are big enough.
1. It should be in observer's Sky
2. The observer should be in dark (at least Nautical twilight)
3. the satellite should still have sun shining on it
4. weather?

### TLE
To do any calculations related to a satellite, we first need to get the `Two Line Elements`  for the satellite. TLE describes the orbit of the satellite. Using TLE and SGP4 model (satellite.js) we can calculate the state vector of the satellite at any time.

In this case we are using [https://tle.ivanstanojevic.me/api/tle]("https://tle.ivanstanojevic.me/api/tle") here we can search satellite and get their tle but we already know whose tle's to fetch, ISS and Tiangong (Chinese Space Station), so we use their
norad ID's.
I ran a script for few days and got to know that the TLE's get updated every 6-12 hours but we don't need that much accuracy, we cache the tle in localStorage for 24 Hours.

### Look Angle
Look angle is the angle at which the satellite is in the sky (or bleow ground).
for *condition 1* to be true, the elevation of satellite should be at least 10 degree and for *condition 2* to be true, the sun should be below 6 degree of the horizon (Nautical twilight or beyond)

### Illumination
This one was the trikiest, as explain in this column [Visually Observing Earth Satellites](https://celestrak.org/columns/v03n01/) the earth casts a really long Cone shaped shadow but I ignored that and assumed that Earth casts a cylindrical shadow extending infinitely in the anti-solar direction. A satellite is eclipsed if it lies within this shadow cylinder.

we project satellite onto Earth-Sun line: Use dot product to see which side of Earth the satellite is on

if in shadow cylinder:

If satellite is on sunward side → illuminated

If on anti-sunward side, calculate perpendicular distance from Earth-Sun line

If perpendicular distance < Earth radius → eclipsed

Otherwise → illuminated

### Calculations
the `computePasses`  propogates from start time to the endtime with a delta currently hardcoded to 30 seconds, it checks if the object is visible or not using calculateVisibility, if we get false we continue but if we get true, we go back 30 seconds and start going thorugh the time second by second we do this until the object is not Visible again, this way we calculate an accurate pass.

### Improving in Calculations
feel free to contribute.

- [ ] use a different method then iterating with 30 second interval (Something inspired from the following methods, not exacatly these methods - described here [Real-World Benchmarking](https://celestrak.org/columns/v03n02/))
	- Bisection Method
	- Golden Section Method
	- Newton Rhapson Method
- [ ] not check for passes in daytime (would cut the calculation in half)
- [ ] draw a circle on the map and only check further if the percieved latitude and longitude of satellite fall in that circle (basically not calculating look angle and handling everything in latitude and longitude)
- [ ] use rust

### Other Improvements
- [ ] use state management library instead of prop drilling (i didn't expect it to go this complicated)
- [ ] add theme toggle
- [ ] use something like an api or a map to get elevation at user's location


## Technical Resources

### Orbital Mechanics & TLE Format
- [Demystifying the USSPACECOM Two-Line Element Set Format](https://keeptrack.space/deep-dive/two-line-element-set/) - Comprehensive explanation of TLE format
- [Computers and Satellites](https://celestrak.org/columns/) - Primary resource for orbital calculation mathematics

### APIs
- [NASA's TLE API](http://tle.ivanstanojevic.me/api/tle) - Provides up-to-date TLE data for the ISS
- [Additional NASA APIs](https://api.nasa.gov/) - Other potential data sources for the project (only the previous api is used in this project in the current state)
