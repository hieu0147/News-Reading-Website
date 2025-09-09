import { Request, Response } from 'express';
import { ArticleModel } from '../models/article';
import { CategoryModel } from '../models/category';
import { RssScraper } from '../services/rssScraper';

export class ArticleController {
    private articleModel: ArticleModel;
    private categoryModel: CategoryModel;
    private rssScraper: RssScraper;

    constructor() {
        this.articleModel = new ArticleModel();
        this.categoryModel = new CategoryModel();
        this.rssScraper = new RssScraper();
    }

    // Lấy tất cả bài viết
    async getAllArticles(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            // Lấy tổng số bài viết
            const total = await this.articleModel.getTotalCount();
            const articles = await this.articleModel.getAll(limit, offset);

            res.json({
                success: true,
                data: articles,
                total,
                pagination: {
                    page,
                    limit,
                    offset
                }
            });
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách bài viết:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách bài viết'
            });
        }
    }

    // Lấy bài viết theo category (dùng slug)
    async getArticlesByCategory(req: Request, res: Response): Promise<void> {
        try {
            const { category } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            // Lấy category_id từ slug
            const cat = await this.categoryModel.findBySlug(category);
            if (!cat) {
                res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
                return;
            }
            // Lấy tổng số bài viết thuộc category
            const total = await this.articleModel.getTotalCountByCategory(cat.id!);
            const articles = await this.articleModel.getByCategoryId(cat.id!, limit, offset);

            res.json({
                success: true,
                data: articles,
                total,
                category,
                pagination: {
                    page,
                    limit,
                    offset
                }
            });
        } catch (error) {
            console.error('❌ Lỗi khi lấy bài viết theo category:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy bài viết theo category'
            });
        }
    }

    // Tìm kiếm bài viết (theo title hoặc content)
    async searchArticles(req: Request, res: Response): Promise<void> {
        try {
            const { keyword } = req.query;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            if (!keyword || typeof keyword !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Từ khóa tìm kiếm là bắt buộc'
                });
                return;
            }

            // Tìm kiếm thủ công bằng SQL
            const articles = await this.articleModel.search(keyword, limit, offset);

            res.json({
                success: true,
                data: articles,
                keyword,
                pagination: {
                    page,
                    limit,
                    offset
                }
            });
        } catch (error) {
            console.error('❌ Lỗi khi tìm kiếm bài viết:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi tìm kiếm bài viết'
            });
        }
    }

    // Lấy bài viết theo ID
    async getArticleById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const article = await this.articleModel.findById(id);
            if (!article) {
                res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy bài viết'
                });
                return;
            }
            res.json({
                success: true,
                data: article
            });
        } catch (error) {
            console.error('❌ Lỗi khi lấy bài viết theo ID:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy bài viết'
            });
        }
    }

    // Chạy thu thập dữ liệu RSS thủ công
    async runScraping(req: Request, res: Response): Promise<void> {
        try {
            this.rssScraper.scrapeAllFeeds().then(() => {
                console.log('✅ Hoàn thành thu thập dữ liệu RSS thủ công');
            }).catch((error: any) => {
                console.error('❌ Lỗi khi thu thập dữ liệu RSS thủ công:', error);
            });

            res.json({
                success: true,
                message: 'Đã bắt đầu thu thập dữ liệu từ RSS Tuổi Trẻ'
            });
        } catch (error) {
            console.error('❌ Lỗi khi chạy thu thập dữ liệu:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi chạy thu thập dữ liệu'
            });
        }
    }

    // Lấy thống kê bài viết
    async getArticleStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await this.articleModel.getStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('❌ Lỗi khi lấy thống kê bài viết:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thống kê'
            });
        }
    }

    async getArticlesAdvanced(req: Request, res: Response): Promise<void> {
        try {
            const {
                keyword,
                category,
                sort,
                order,
                page = '1',
                limit = '20',
            } = req.query;

            const result = await this.articleModel.getList({
                keyword: keyword as string,
                categorySlug: category as string,
                sort: sort as string,
                order: (order as 'asc' | 'desc') || 'desc',
                page: parseInt(page as string) || 1,
                limit: parseInt(limit as string) || 20,
            });

            res.json({
                success: true,
                data: result.data,
                total: result.total,
                pagination: {
                    page: parseInt(page as string) || 1,
                    limit: parseInt(limit as string) || 20,
                },
            });
        } catch (error) {
            console.error('❌ Lỗi khi lấy danh sách bài viết:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách bài viết',
            });
        }
    }

    async createArticle(req: Request, res: Response) {
        try {
            const article = await this.articleModel.create(req.body);
            res.json({ success: true, data: article });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi thêm bài viết' });
        }
    }

    async updateArticle(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updated = await this.articleModel.updateArticle(id, req.body);
            if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
            res.json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi sửa bài viết' });
        }
    }

    async deleteArticle(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const ok = await this.articleModel.deleteArticle(id);
            if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi xóa bài viết' });
        }
    }
} 