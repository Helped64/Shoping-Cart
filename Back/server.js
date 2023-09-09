const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// PayPal SDK Configuration
const clientId = 'AcwTZchup3mJRZVlu3GT0swiq-A78h0BbfGMjZJGKZT5w3zRSzrvrrlypxnh0aJjOjAolWe8rVqkTgLp'; // Replace with your actual PayPal client ID
const clientSecret = 'EP8KtSjYB2mcFZoWEvR9jU5Ir0CNhVY1AGg3S_FF8wNUttU5u5MBC11i1pfQ_wuTX2EN6SmtK6HLrCFW'; // Replace with your actual PayPal client secret

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

app.use(express.json());

// Route to initiate PayPal payment
app.post('/create-payment', async (req, res) => {
    try {
        // Capture buyer information from req.body
        const { firstName, lastName, email, phone, addressLine1, addressLine2, state, zip, country } = req.body;

        // Create a PayPal order with buyer information
        const orderRequest = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: '19.99', // Replace with actual product price
                    },
                    shipping: {
                        name: {
                            full_name: `${firstName} ${lastName}`,
                        },
                        address: {
                            address_line_1: addressLine1,
                            address_line_2: addressLine2,
                            admin_area_2: state,
                            postal_code: zip,
                            country_code: country,
                        },
                    },
                },
            ],
            payer: {
                email_address: email,
                phone: {
                    phone_type: "MOBILE",
                    phone_number: {
                        national_number: phone,
                    },
                },
                name: {
                    given_name: firstName,
                    surname: lastName,
                },
            },
        };

        // Use PayPal SDK to create an order
        const request = new paypal.orders.OrdersCreateRequest();
        request.requestBody(orderRequest);

        const orderResponse = await client.execute(request);

        // Return the order details to the frontend
        res.json({
            orderId: orderResponse.result.id,
            links: orderResponse.result.links,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to capture/execute the payment
app.post('/capture-payment', async (req, res) => {
    try {
        // Capture the order ID from the request body
        const { orderId } = req.body;

        // Use PayPal SDK to capture the payment
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        const captureResponse = await client.execute(request);

        // Check if the payment capture was successful
        if (captureResponse.result.status === 'COMPLETED') {
            // Payment was successfully captured
            res.json({ status: 'success', message: 'Payment captured successfully' });
        } else {
            // Payment capture failed
            res.json({ status: 'failure', message: 'Payment capture failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
