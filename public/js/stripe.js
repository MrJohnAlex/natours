// import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(process.env.STRIPE_PUB_KEY);

export const bookTour = async (tourId) => {
  try {
    // 1. Get the checkout session from the API
    const response = await fetch(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`Failed to fetch session: ${response.statusText}`);
    }

    // Parse the response as JSON
    const session = await response.json();

    // 2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.session.id, // Corrected here
    });
  } catch (error) {
    console.log('error');
    showAlert('error', error);
  }
};
