import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

export const PRICE_IDS: Record<string, string | undefined> = {
  pro_monthly: process.env.STRIPE_PRO_PRICE_ID,
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  business_monthly: process.env.STRIPE_BUSINESS_PRICE_ID,
  business_annual: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID,
}

export function getPriceId(plan: string, billing: 'monthly' | 'annual'): string | undefined {
  return PRICE_IDS[`${plan}_${billing}`]
}
