import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
const router = Router();
const controller = new CategoryController();

router.get('/', controller.getAllCategories.bind(controller));
export default router; 