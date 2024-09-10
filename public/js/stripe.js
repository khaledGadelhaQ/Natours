import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51PwkpVEb9dD7crJWsIBzcBWPQbEbn0hK33EGLQR7ssO1qdR1apXoxNqgFJhmUMOM6jrgZiOyoHutiXTTti34xBPM00gvOYkaqy',
  );
  try {
    //1)Get session from the server
    const session = await axios(
      `/api/bookings/checkout-session/${tourId}`,
    );
    //2)Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
