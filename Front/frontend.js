// Define custom functions for creating and capturing PayPal payment
function createPayPalPayment() {
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value; // Add last name
    const email = document.getElementById('email').value; // Add email
    const phone = document.getElementById('phone').value; // Add phone

    // Capture shipping address fields
    const addressLine1 = document.getElementById('address-line-1').value;
    const addressLine2 = document.getElementById('address-line-2').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    const country = document.getElementById('country').value;

    const buyerInfo = {
        firstName: firstName,
        lastName: lastName, // Include last name
        email: email, // Include email
        phone: phone, // Include phone
        addressLine1: addressLine1, // Include address line 1
        addressLine2: addressLine2, // Include address line 2
        state: state, // Include state
        zip: zip, // Include zip
        country: country, // Include country
    };

    fetch('/create-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(buyerInfo),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server, which may include the order ID and payment links
        const orderId = data.orderId;
        const paymentLinks = data.links;

        // Redirect the user to PayPal for payment
        window.location.href = paymentLinks[1].href; // Assuming this is the approval_url
    })
    .catch(error => {
        console.error('Error creating PayPal payment:', error);
    });
}

function capturePayPalPayment(orderId) {
    fetch('/capture-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: orderId }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server, which may indicate success or failure
        if (data.status === 'success') {
            // Payment capture was successful
            alert('Payment captured successfully.');
        } else {
            // Payment capture failed
            alert('Payment capture failed.');
        }
    })
    .catch(error => {
        console.error('Error capturing PayPal payment:', error);
    });
}

// PayPal Buttons configuration
paypal.Buttons({
    createOrder: function(data, actions) {
        // Capture buyer information from the form
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        // Capture shipping address fields
        const addressLine1 = document.getElementById('address-line-1').value;
        const addressLine2 = document.getElementById('address-line-2').value;
        const state = document.getElementById('state').value;
        const zip = document.getElementById('zip').value;
        const country = document.getElementById('country').value;

        return actions.order.create({
            purchase_units: [
                {
                    description: 'Product Description',
                    amount: {
                        value: '19.99', // Replace with actual product price
                        currency_code: 'USD'
                    }
                }
            ],
            payer: {
                email_address: email, // Include email
                phone: {
                    phone_number: {
                        national_number: phone // Include phone number
                    }
                },
                name: {
                    given_name: firstName, // Include first name
                    surname: lastName // Include last name
                },
                address: {
                    address_line_1: addressLine1, // Include address line 1
                    address_line_2: addressLine2, // Include address line 2
                    admin_area_2: state, // Include state
                    postal_code: zip, // Include zip
                    country_code: country // Include country
                }
            }
        });
    },
    onApprove: function(data, actions) {
        // Handle when the payment is approved
        return actions.order.capture().then(function(details) {
            // Show a thank-you message to the buyer
            alert('Thank you for your purchase! Transaction ID: ' + details.id);
        });
    }
}).render('#paypal-buttons');

// Event listener for the PayPal button click
document.getElementById('paypal-buttons').addEventListener('click', function () {
    createPayPalPayment();
});

