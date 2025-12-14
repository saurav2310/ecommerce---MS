import {Router,Request,Response} from 'express';
import { createProduct, deleteProduct, getProduct, getProducts, udpateProduct } from '../controllers/product.controller';
import { shouldBeAdmin } from '../middleware/authMiddleware';

const router:Router = Router();

router.post("/",shouldBeAdmin, createProduct)
router.put("/:id",shouldBeAdmin,udpateProduct)
router.delete("/:id",shouldBeAdmin,deleteProduct)
router.get("/",getProducts)
router.get("/:id",getProduct)


export default router;