import Fastify from "fastify"
import { clerkPlugin, getAuth } from '@clerk/fastify'
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { connectOrderDb } from "@repo/order-db";
import { orderRoute } from "./routes/order.js";

const fastify = Fastify();

fastify.register(clerkPlugin)

fastify.get("/health", (request, reply) => {

    return reply.status(200).send({
        status: "ok",
        uptime: process.uptime(),
        timeStamp: Date.now()
    })
})
fastify.get("/test",{preHandler:shouldBeUser}, (request, reply) => {

   
    return reply.send({ message: "Order Service is authenticated",userId:request.userId })
})

fastify.register(orderRoute);

const start = async () => {
    try {
        await connectOrderDb();
        await fastify.listen({ port: 8001 })
        console.log("Order service is running on port 8001")
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
start();