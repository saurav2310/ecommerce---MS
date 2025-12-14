import { Hono } from "hono";
import stripe from "../utils/stripe";
import { shouldBeUser } from "../middleware/authMiddleware";
import { CartItemsType } from "@repo/types";
import { getStripeProductPrice } from "../utils/stripeProduct";

const sessionRoute = new Hono();

sessionRoute.post('/create-checkout-session', shouldBeUser, async (c) => {

  const {cart}:{cart:CartItemsType} = await c.req.json();
  const userId = c.get("userId");

  const lineItems = await Promise.all(
    cart.map(async (item)=>{
      const unitAmout = await getStripeProductPrice(item.id);
      return{
        price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: unitAmout as number,
          },
          quantity: item.quantity,
      }
    })
  );

  try {

    const session = await stripe.checkout.sessions.create({
      client_reference_id:userId.toString(),
      line_items: lineItems,
      mode: 'payment',
      ui_mode: 'embedded',
      // ui_mode: 'custom',
      // The URL of your payment completion page
      return_url: 'http://localhost:3002/return?session_id={CHECKOUT_SESSION_ID}'
    });

    return c.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return c.json({ error });
  }
});

sessionRoute.get("/:session_id",async (c)=>{
  const session = await stripe.checkout.sessions.retrieve(c.req.param("session_id"));
  return c.json({
    status:session.status,
    paymentStatus:session.payment_status,
  });
})

export default sessionRoute;