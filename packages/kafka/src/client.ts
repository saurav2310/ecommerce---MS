import {Kafka} from "kafkajs";

export const createKafkaClient = (service:string) =>{
    return new Kafka({
        clientId:service,
        brokers:["localhost:29092","localhost:39092","localhost:49092"]
    })
}