import { Pool } from 'pg';
import { pool } from './db';

export interface Category {
    id?: number;
    name: string;
    slug: string;
}

export class CategoryModel {
    private pool: Pool;
    constructor() {
        this.pool = pool;
    }

    async findBySlug(slug: string): Promise<Category | null> {
        const query = 'SELECT * FROM categories WHERE slug = $1';
        const result = await this.pool.query(query, [slug]);
        return result.rows[0] || null;
    }

    async createIfNotExists(name: string, slug: string): Promise<Category> {
        let category = await this.findBySlug(slug);
        if (category) return category;
        const query = 'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *';
        const result = await this.pool.query(query, [name, slug]);
        return result.rows[0];
    }

    async getAll(): Promise<Category[]> {
        const query = 'SELECT * FROM categories ORDER BY id';
        const result = await this.pool.query(query);
        return result.rows;
    }

    async getTotalCount(): Promise<number> {
        const result = await this.pool.query('SELECT COUNT(*) FROM categories');
        return parseInt(result.rows[0].count);
    }
} 