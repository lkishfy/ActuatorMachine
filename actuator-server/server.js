"use strict";

const express = require('express');
const gpiox = require("@iiot2k/gpiox");

const app = express();
const PORT = 3000;

// Define GPIO pins for actuators
const actuatorPins = [6, 13, 19, 26];

// Initialize GPIO pins as outputs
actuatorPins.forEach(pin => gpiox.init_gpio(pin, gpiox.GPIO_MODE_OUTPUT, 0));

// Function to activate actuators sequentially for 2 seconds each
async function activateActuators() {
    try {
        // Sequentially activate each actuator for 2 seconds
        for (let i = 0; i < actuatorPins.length; i++) {
            const pin = actuatorPins[i];

            // Turn on the current actuator
            gpiox.set_gpio(pin, 1);

            // Wait for 2 seconds
            await delay(2000);

            // Turn off the current actuator
            gpiox.set_gpio(pin, 0);
        }

        console.log('Actuators activated sequentially for 2 seconds each.');
    } catch (error) {
        console.error('Error:', error);
    }
}

// Utility function to create delay using promises
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Endpoint to activate actuators
app.get('/activate', async (req, res) => {
    await activateActuators();
    res.send('Actuators activated sequentially for 2 seconds each.');
});

// Initialize and activate actuators on server startup
activateActuators().then(() => {
    // Start the server after initialization
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error initializing and activating actuators:', err);
});
