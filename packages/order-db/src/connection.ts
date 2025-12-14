import mongoose from 'mongoose'

let isConneted = false;

export const connectOrderDb = async () => {

    if (isConneted) return;

    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL is not defined in env file");
    }
    try {
        await mongoose.connect(process.env.MONGO_URL);
        isConneted = true;
        console.log("connected to MongoDB")
    } catch (error) {
        console.log(error);
        throw error;
    }
}