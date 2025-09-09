import { Router } from 'express';
import { ArticleController } from '../controllers/articleController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const articleController = new ArticleController();

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Lấy danh sách bài viết (có phân trang)
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số bài viết mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 */
router.get('/', articleController.getAllArticles.bind(articleController));

/**
 * @swagger
 * /articles/search:
 *   get:
 *     summary: Tìm kiếm bài viết theo từ khóa (title hoặc content)
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số bài viết mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách bài viết phù hợp
 */
router.get('/search', articleController.searchArticles.bind(articleController));

// Lấy thống kê bài viết
router.get('/stats', articleController.getArticleStats.bind(articleController));

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Lấy chi tiết bài viết
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết bài viết
 */
router.get('/:id', articleController.getArticleById.bind(articleController));

// Lấy bài viết theo category
router.get('/category/:category', articleController.getArticlesByCategory.bind(articleController));

// Chạy thu thập dữ liệu thủ công (chỉ admin)
router.post('/scrape', articleController.runScraping.bind(articleController));

// Lấy bài viết nâng cao
router.get('/advanced', articleController.getArticlesAdvanced.bind(articleController));

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Thêm bài viết mới
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Thêm bài viết thành công
 */
router.post('/', authenticateToken, articleController.createArticle.bind(articleController));

/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Sửa bài viết
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *               category_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sửa bài viết thành công
 */
router.put('/:id', authenticateToken, articleController.updateArticle.bind(articleController));

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Xóa bài viết
 *     tags:
 *       - Articles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa bài viết thành công
 */
router.delete('/:id', authenticateToken, articleController.deleteArticle.bind(articleController));

export default router; 