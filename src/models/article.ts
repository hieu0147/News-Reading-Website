import { Pool } from 'pg';
import { pool } from './db';

export interface Article {
    id?: string;
    title: string;
    slug: string;
    content: string;
    thumbnail?: string;
    views?: number;
    published_at?: Date;
    category_id?: number;
    author_id?: string;
    created_at?: Date;
    updated_at?: Date;
}

export class ArticleModel {
    private pool: Pool;

    constructor() {
        this.pool = pool;
    }

    async createTable(): Promise<void> {
        const query = `
            CREATE TABLE IF NOT EXISTS articles (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(500) NOT NULL,
                slug VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                thumbnail TEXT,
                views INT,
                published_at TIMESTAMP,
                category_id INT,
                author_id VARCHAR(200),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await this.pool.query(query);
    }

    async findBySlug(slug: string): Promise<Article | null> {
        const query = 'SELECT * FROM articles WHERE slug = $1';
        const result = await this.pool.query(query, [slug]);
        return result.rows[0] || null;
    }

    async create(article: Article): Promise<Article> {
        const query = `
            INSERT INTO articles (title, slug, content, thumbnail, published_at, category_id, author_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            article.title,
            article.slug,
            article.content,
            article.thumbnail,
            article.published_at,
            article.category_id,
            article.author_id
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async getAll(limit: number = 50, offset: number = 0): Promise<Article[]> {
        const query = `
            SELECT * FROM articles 
            ORDER BY published_at DESC 
            LIMIT $1 OFFSET $2
        `;
        const result = await this.pool.query(query, [limit, offset]);
        return result.rows;
    }

    async getByCategoryId(category_id: number, limit: number = 50, offset: number = 0): Promise<Article[]> {
        const query = `
            SELECT * FROM articles 
            WHERE category_id = $1
            ORDER BY published_at DESC 
            LIMIT $2 OFFSET $3
        `;
        const result = await this.pool.query(query, [category_id, limit, offset]);
        return result.rows;
    }

    async getStats(): Promise<any> {
        const query = `
            SELECT 
                COUNT(*) as total_articles,
                COUNT(DISTINCT category_id) as total_categories,
                category_id,
                COUNT(*) as category_count
            FROM articles 
            GROUP BY category_id
            ORDER BY category_count DESC
        `;
        const result = await this.pool.query(query);

        const totalQuery = 'SELECT COUNT(*) as total FROM articles';
        const totalResult = await this.pool.query(totalQuery);

        return {
            total: parseInt(totalResult.rows[0].total),
            categories: result.rows
        };
    }

    async search(keyword: string, limit: number = 50, offset: number = 0): Promise<Article[]> {
        const query = `
            SELECT * FROM articles 
            WHERE title ILIKE $1 OR content ILIKE $1
            ORDER BY published_at DESC 
            LIMIT $2 OFFSET $3
        `;
        const result = await this.pool.query(query, [`%${keyword}%`, limit, offset]);
        return result.rows;
    }

    async findById(id: string): Promise<Article | null> {
        const query = 'SELECT * FROM articles WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async getList(options: {
        keyword?: string;
        categorySlug?: string;
        sort?: string;
        order?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    }): Promise<{ data: Article[]; total: number }> {
        const {
            keyword,
            categorySlug,
            sort = 'published_at',
            order = 'desc',
            page = 1,
            limit = 20,
        } = options;

        let where: string[] = [];
        let params: any[] = [];
        let joins = '';

        if (keyword) {
            params.push(`%${keyword}%`);
            where.push(`(a.title ILIKE $${params.length} OR a.content ILIKE $${params.length})`);
        }
        if (categorySlug) {
            joins += ' JOIN categories c ON a.category_id = c.id ';
            params.push(categorySlug);
            where.push(`c.slug = $${params.length}`);
        }

        const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
        const offset = (page - 1) * limit;
        const orderBy = ['published_at', 'views', 'title'].includes(sort) ? sort : 'published_at';
        const orderDir = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // Đếm tổng số bản ghi
        const countQuery = `
            SELECT COUNT(*) FROM articles a
            ${joins}
            ${whereClause}
        `;
        const countResult = await this.pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Lấy dữ liệu phân trang
        const dataQuery = `
            SELECT a.* FROM articles a
            ${joins}
            ${whereClause}
            ORDER BY a.${orderBy} ${orderDir}
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        const dataParams = [...params, limit, offset];
        const dataResult = await this.pool.query(dataQuery, dataParams);

        return { data: dataResult.rows, total };
    }

    async getTotalCount(): Promise<number> {
        const result = await this.pool.query('SELECT COUNT(*) FROM articles');
        return parseInt(result.rows[0].count);
    }

    async getTotalCountByCategory(category_id: number): Promise<number> {
        const result = await this.pool.query('SELECT COUNT(*) FROM articles WHERE category_id = $1', [category_id]);
        return parseInt(result.rows[0].count);
    }

    async updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
        const fields = [];
        const values = [];
        let idx = 1;
        for (const key in data) {
            fields.push(`${key} = $${idx++}`);
            values.push((data as any)[key]);
        }
        values.push(id);
        const query = `UPDATE articles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async deleteArticle(id: string): Promise<boolean> {
        const query = 'DELETE FROM articles WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
} 