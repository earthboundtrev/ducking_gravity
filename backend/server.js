// Commenting out entire server implementation for frontend testing
/*
require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Commenting out Stripe initialization
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

// Donation amounts in cents
const DONATION_AMOUNTS = {
  small: 2500,    // $25
  medium: 5000,   // $50
  large: 10000,   // $100
  custom: null    // Allow custom amount
};

// Commenting out Stripe-related endpoint
/*
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { amount, customAmount } = req.body;
    
    // Validate the amount
    let donationAmount = DONATION_AMOUNTS[amount];
    if (amount === 'custom' && customAmount) {
      donationAmount = Math.max(500, Math.floor(customAmount * 100));
    }
    
    if (!donationAmount && amount !== 'custom') {
      return res.status(400).json({ error: 'Invalid donation amount' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to Ducking Gravity Studio',
              description: 'Support our aerial arts studio development',
            },
            unit_amount: donationAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/donation-success`,
      cancel_url: `${process.env.CLIENT_URL}/donate`,
      metadata: {
        purpose: 'studio_development',
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Commenting out webhook handler
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment successful:', session);
  }

  res.json({ received: true });
});
*/

// Add a test endpoint instead
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
*/

// You can just run your frontend Vite server for now
console.log('Backend server temporarily disabled for frontend testing'); 