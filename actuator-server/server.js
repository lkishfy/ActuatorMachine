"use strict";

const express = require('express');
const gpiox = require("@iiot2k/gpiox");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3001;

const corsOptions = {
    origin: 'http://localhost:3000', // Make sure this matches your frontend origin exactly
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  };

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Define GPIO pins for actuators (forward and backward for each)
const actuatorPins = [
    { forward: 21, backward: 16 },   // Actuator 1: GPIO 6 (forward), GPIO 5 (backward)
    { forward: 12, backward: 25 }, // Actuator 2: GPIO 13 (forward), GPIO 12 (backward)
    { forward: 23, backward: 18 }, // Actuator 3: GPIO 19 (forward), GPIO 16 (backward)
    { forward: 12, backward: 16 }  // Actuator 4: GPIO 26 (forward), GPIO 20 (backward)
];

// Initialize GPIO pins as outputs
actuatorPins.forEach(actuator => {
    gpiox.init_gpio(actuator.forward, gpiox.GPIO_MODE_OUTPUT, 0);
    gpiox.init_gpio(actuator.backward, gpiox.GPIO_MODE_OUTPUT, 0);
    gpiox.set_gpio(actuator.forward, 0);
    gpiox.set_gpio(actuator.backward, 0);
});

// Function to create delay using promises
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function moveActuator(index, direction) {
    const actuator = actuatorPins[index];
    if (direction === 'forward') {
        gpiox.set_gpio(actuator.forward, 1);
        gpiox.set_gpio(actuator.backward, 0);
    } else {
        gpiox.set_gpio(actuator.forward, 0);
        gpiox.set_gpio(actuator.backward, 1);
    }
    await delay(2000); // Move for 2 seconds
    gpiox.set_gpio(actuator.forward, 0);
    gpiox.set_gpio(actuator.backward, 0);
}

function brakeAllActuators() {
    actuatorPins.forEach(actuator => {
        gpiox.set_gpio(actuator.forward, 0);
        gpiox.set_gpio(actuator.backward, 0);
    });
    console.log('All actuators braked.');
}

// Function to control actuators sequentially
async function controlActuators() {
    try {

        brakeAllActuators();

        for (let i = 0; i < actuatorPins.length; i++) {
            const actuator = actuatorPins[i];

            // Move forward
            gpiox.set_gpio(actuator.forward, 1);
            gpiox.set_gpio(actuator.backward, 0);
            console.log(`Actuator ${i + 1} moving forward.`);
            await delay(4000);

            // Brake
            gpiox.set_gpio(actuator.forward, 0);
            gpiox.set_gpio(actuator.backward, 0);
            console.log(`Actuator ${i + 1} braking.`);
            await delay(4000);

            // Move backward
            gpiox.set_gpio(actuator.forward, 0);
            gpiox.set_gpio(actuator.backward, 1);
            console.log(`Actuator ${i + 1} moving backward.`);
            await delay(4000);

            // Brake
            gpiox.set_gpio(actuator.forward, 0);
            gpiox.set_gpio(actuator.backward, 0);
            console.log(`Actuator ${i + 1} braking.`);
            await delay(4000);
        }

        console.log('Actuator control sequence completed.');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Endpoint to control actuators
app.post('/control', cors(corsOptions), async (req, res) => {
    const { index, direction } = req.body;
    if (index >= 0 && index < actuatorPins.length && (direction === 'forward' || direction === 'backward')) {
      await moveActuator(index, direction);
      res.send(`Actuator ${index + 1} moved ${direction}.`);
    } else {
      res.status(400).send('Invalid request.');
    }
  });

app.get('/testCors', (req, res) => {
    res.send('CORS is working!');
    console.log("CORS is working");
});

// Initialize and start server
controlActuators().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error initializing and controlling actuators:', err);
});
