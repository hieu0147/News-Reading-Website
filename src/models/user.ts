import { Pool } from 'pg';
import { pool } from './db';
import bcrypt from 'bcrypt';

export interface User {
    id?: string;
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
    created_at?: Date;
    updated_at?: Date;
}

export class UserModel {
    private pool: Pool;
    constructor() {
        this.pool = pool;
    }

    async createUser(user: User): Promise<User> {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const query = `
            INSERT INTO users (name, email, password, role, phone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [user.name, user.email, hashedPassword, user.role || 'user', user.phone || null];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async updateUser(id: string, data: Partial<User>): Promise<User | null> {
        const fields = [];
        const values = [];
        let idx = 1;
        for (const key in data) {
            if (key === 'password' && data.password) {
                const hashed = await bcrypt.hash(data.password, 10);
                fields.push(`password = $${idx++}`);
                values.push(hashed);
            } else if (key !== 'password' && key !== 'email') {
                fields.push(`${key} = $${idx++}`);
                values.push((data as any)[key]);
            }
        }
        values.push(id);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async deleteUser(id: string): Promise<boolean> {
        const query = 'DELETE FROM users WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async getAll(): Promise<User[]> {
        const query = 'SELECT * FROM users ORDER BY created_at DESC';
        const result = await this.pool.query(query);
        return result.rows;
    }

    async findById(id: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async getTotalCount(): Promise<number> {
        const result = await this.pool.query('SELECT COUNT(*) FROM users');
        return parseInt(result.rows[0].count);
    }
} 