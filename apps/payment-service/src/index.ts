import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { clerkMiddleware } from '@hono/clerk-auth'
import sessionRoute from './routes/session.route.js'
import webhookRoute from './routes/webhooks.route.js'

import { cors } from "hono/cors";
import { consumer, producer } from './utils/kafka.js'
import { runKafkaSubscriptions } from './utils/subscriptions.js'
const app = new Hono()


app.use('*', clerkMiddleware());
app.use("*",cors({origin:["http://localhost:3002"]}));
app.get('/health', (c) => {
    return c.json({
        status: "ok",
        uptime: process.uptime(),
        timeStamp: Date.now()
    })
});

app.route("/sessions",sessionRoute);
app.route("/webhooks",webhookRoute);
// app.get('/pay', shouldBeUser,async (c) => {
//     const {products} = await c.req.json();

//     const totalPrice = await Promise.all(
//         products.map(async (product:any)=>{
//             const productInDb:any = await fetch(`localhost:8000/products/${product.id}`);
//             return productInDb.price*product.quantity;
//         })
//     );

//     return c.json({
//         message: 'Payment Service authenticated!',
//         userId:c.get("userId")
//     })
// })
// app.post('/create-stripe-product',async (c) => {
//     const res = await stripe.products.create({
//         id:"123",
//         name:"Test Product",
//         default_price_data:{
//             currency:"inr",
//             unit_amount:10*100,
//         }
//     });
//     return c.json(res);
// });
// app.get('/stripe-product-price',async (c) => {
    // const res = await stripe.prices.list({
    //     product:"123",
    // })
//     return c.json(res);
// });

const start = async () => {
    try {

        Promise.all([
          await producer.connect(),
          await consumer.connect(),  
        ]);
        await runKafkaSubscriptions();
        serve({
            fetch: app.fetch,
            port: 8002
        }, (info) => {
            console.log(`Payment Service is running on http://localhost:${info.port}`)
        })

    } catch (error) {
        console.log(error);
        process.exit(1);

    }
}

start();