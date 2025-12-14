import express, {NextFunction, request, Request,Response} from 'express'
import cors from 'cors';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { shouldBeUser } from './middleware/authMiddleware.js';
import productRouter from './routes/product.route.js';
import categoryRouter from './routes/category.route.js';



const app = express();
app.use(cors({
    origin:["http://localhost:3002","http://localhost:3003"],
    credentials:true,
}))
app.use(express.json());

app.use(clerkMiddleware());

app.get("/health",(req:Request,res:Response)=>{
    res.status(200).json({
        status:"ok",
        uptime:process.uptime(),
        timeStamp:Date.now()
    })
})

app.use("/products",productRouter);
app.use("/categories",categoryRouter);

app.get("/test",shouldBeUser,(req:Request,res:Response)=>{
    res.json({message:"Product service authenticated",userid:req.userId});
});


app.use((err:any,req:Request,res:Response,next:NextFunction)=>{
    console.log(err);
    res.status(err.status||500).json({message:err.message||"Internal Sever Error"});
})

app.listen(8000,()=>{
    console.log("Product service is running on port 8000");
    
})