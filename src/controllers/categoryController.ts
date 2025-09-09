import { Request, Response } from 'express';
import { CategoryModel } from '../models/category';

export class CategoryController {
    private categoryModel = new CategoryModel();

    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await this.categoryModel.getAll();
            const total = await this.categoryModel.getTotalCount();
            res.json({ success: true, data: categories, total });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh mục' });
        }
    }
} 