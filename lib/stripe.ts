import { StripeProvider } from '@stripe/stripe-react-native'

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!

export { StripeProvider, publishableKey }