import { pool } from './models/db';

(async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Kết nối database thành công:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('Kết nối database thất bại:', err);
        process.exit(1);
    }
})(); 