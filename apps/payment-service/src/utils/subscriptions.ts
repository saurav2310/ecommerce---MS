import { consumer } from "./kafka"
import { createStripeProduct, deleteStripeProduct } from "./stripeProduct";

export const runKafkaSubscriptions = async ()=>{
    consumer.subscribe("product.created",async(message)=>{
        const product = message.value;
        console.log("Received product.created event:",product);

        await createStripeProduct(product);

    })

    consumer.subscribe("product.deleted",async(message)=>{
        const productId = message.value;
        console.log("Received message: product.delete",productId);
        await deleteStripeProduct(productId);
    })
}