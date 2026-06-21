const express = require("express");
const axios = require("axios");
const path = require("path");
const morgan = require("morgan");
const NodeCache = require("node-cache");

const app = express();
const cache = new NodeCache({ stdTTL: 300 });

const apiKey = "a65e59810e63c576b147be60ab5ca19d";

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Weather App</title>
        </head>
        <body style="text-align:center; font-family:Arial; margin-top:100px;">
            <h1>🌦 Weather App</h1>

            <form action="/weather" method="POST">
                <input
                    type="text"
                    name="city"
                    placeholder="Enter City Name"
                    required
                >
                <button type="submit">Get Weather</button>
            </form>
        </body>
        </html>
    `);
});

app.post("/weather", async (req, res) => {

    const city = req.body.city.toLowerCase();

    if (cache.has(city)) {
        console.log("Serving from cache");
        return res.send(cache.get(city));
    }

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        const data = response.data;

        const html = `
        <link rel="stylesheet" href="/style.css">

        <div class="container">
            <h1>🌦 Weather Details</h1>

            <h2>📍 ${data.name}</h2>
            <h2>🌡 ${data.main.temp} °C</h2>
            <h2>☁ ${data.weather[0].description}</h2>
            <h2>💧 Humidity: ${data.main.humidity}%</h2>

            <a href="/">
                <button>Search Another City</button>
            </a>
        </div>
        `;

        cache.set(city, html);

        res.send(html);

    } catch (error) {
        res.send("City not found");
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});