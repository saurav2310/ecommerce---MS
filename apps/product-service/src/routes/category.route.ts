import {Router,Request,Response} from 'express';
import { createCategory, deleteCategory, getCategories, udpateCategory } from '../controllers/category.controller';
import { shouldBeAdmin } from '../middleware/authMiddleware';

const router:Router = Router();

router.get("/test",(req:Request,res:Response)=>{
    res.json({message:"Works!"})
})

router.post("/",shouldBeAdmin,createCategory)
router.put("/:id",shouldBeAdmin,udpateCategory)
router.delete("/:id",shouldBeAdmin,deleteCategory)
router.get("/",getCategories)



export default router;