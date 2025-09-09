import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import articleRoutes from './routes/articleRoutes';
import categoryRoutes from './routes/categoryRoutes';
import userRoutes from './routes/userRoutes';
import { pool } from './models/db';
import { CronService } from './services/cronService';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

dotenv.config();
const app = express();

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;

// Khởi động cronjob service
const cronService = new CronService();
cronService.initialize().then(() => {
    console.log('✅ Cronjob service đã được khởi động');
}).catch((error) => {
    console.error('❌ Lỗi khi khởi động cronjob service:', error);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

// Định kỳ xóa các OTP hết hạn mỗi 5 phút
setInterval(async () => {
    try {
        const result = await pool.query('DELETE FROM otp_tokens WHERE expires_at < NOW()');
        if (result.rowCount && result.rowCount > 0) {
            console.log(`Đã xóa ${result.rowCount} OTP hết hạn.`);
        }
    } catch (err) {
        console.error('Lỗi khi xóa OTP hết hạn:', err);
    }
}, 5 * 60 * 1000); // 5 phút 