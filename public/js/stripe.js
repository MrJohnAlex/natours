// import axios from 'axios';
import { showAlert } from './alerts';

// const stripe = Stripe(
//   'pk_test_51LCEpDKItufubWq0ZBNytScKZd1THegaIvq3wC90y50a8as9pFnmDz58RGYEKIAjt0pGG5VcwmKhIdSV0cU3hXs900n2125sQW'
// );

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
    console.log(session);

    // 2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.session.id, // Corrected here
    });
  } catch (error) {
    console.log('error');
    showAlert('error', error);
  }
};
