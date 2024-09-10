import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51PwkpVEb9dD7crJWsIBzcBWPQbEbn0hK33EGLQR7ssO1qdR1apXoxNqgFJhmUMOM6jrgZiOyoHutiXTTti34xBPM00gvOYkaqy',
  );
  try {
    //1)Get session from the server
    const session = await axios(
      `http://127.0.0.1:5000/api/bookings/checkout-session/${tourId}`,
    );
    console.log(session);
    //2)Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
