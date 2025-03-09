import { loadStripe } from '@stripe/stripe-js';

export const getStripe = () => {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  return stripePromise;
}; 