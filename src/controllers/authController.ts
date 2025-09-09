import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../models/db';
import { v4 as uuidv4 } from 'uuid';
import { sendRegisterOtp, sendForgotPasswordOtp } from '../utils/mailer';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ message: 'Email đã tồn tại' });
        const hashed = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        await pool.query(
            'INSERT INTO users (id, email, password, name, status) VALUES ($1, $2, $3, $4, $5)',
            [userId, email, hashed, name, 'inactive']
        );
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);
        await pool.query(
            'INSERT INTO otp_tokens (id, user_id, email, code, expires_at) VALUES ($1, $2, $3, $4, $5)',
            [uuidv4(), userId, email, otp, expires]
        );
        await sendRegisterOtp(email, name, otp);
        res.json({
            message: 'Đăng ký thành công, vui lòng kiểm tra email để xác thực.',
            email: email
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Lỗi server', error: err });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    const { email, code } = req.body;
    try {
        const otpRes = await pool.query(
            'SELECT * FROM otp_tokens WHERE email = $1 AND code = $2 AND expires_at > NOW()',
            [email, code]
        );
        if (otpRes.rows.length === 0) return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
        await pool.query('UPDATE users SET status = $1 WHERE email = $2', ['active', email]);
        await pool.query('DELETE FROM otp_tokens WHERE email = $1', [email]);
        res.json({ message: 'Xác thực thành công, bạn có thể đăng nhập.' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ message: 'Lỗi server', error: err });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userRes.rows[0];
        if (!user) return res.status(400).json({ message: 'Email không tồn tại' });
        if (user.status !== 'active') return res.status(400).json({ message: 'Tài khoản chưa được xác thực' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Sai mật khẩu' });
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Lỗi server', error: err });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userRes.rows[0];
        if (!user) return res.status(400).json({ message: 'Email không tồn tại' });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);
        await pool.query(
            'INSERT INTO otp_tokens (id, user_id, email, code, expires_at) VALUES ($1, $2, $3, $4, $5)',
            [uuidv4(), user.id, email, otp, expires]
        );
        await sendForgotPasswordOtp(email, user.name, otp);
        res.json({ message: 'Đã gửi OTP về email.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Lỗi server', error: err });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;
    try {
        const otpRes = await pool.query(
            'SELECT * FROM otp_tokens WHERE email = $1 AND code = $2 AND expires_at > NOW()',
            [email, code]
        );
        if (otpRes.rows.length === 0) return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashed, email]);
        await pool.query('DELETE FROM otp_tokens WHERE email = $1', [email]);
        res.json({ message: 'Đặt lại mật khẩu thành công.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Lỗi server', error: err });
    }
};

export const resendRegisterOtp = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userRes.rows[0];
        if (!user) return res.status(400).json({ message: 'Email không tồn tại' });
        if (user.status === 'active') return res.status(400).json({ message: 'Tài khoản đã được xác thực' });
        // Xóa các OTP cũ của email này
        await pool.query('DELETE FROM otp_tokens WHERE email = $1', [email]);
        // Tạo OTP mới
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);
        await pool.query(
            'INSERT INTO otp_tokens (id, user_id, email, code, expires_at) VALUES ($1, $2, $3, $4, $5)',
            [uuidv4(), user.id, email, otp, expires]
        );
        await sendRegisterOtp(email, user.name, otp);
        res.json({ message: 'Đã gửi lại OTP xác thực tài khoản.' });
    } catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).json({ message: 'Lỗi server', error: err });
    }
};

export const getUser = async (req: Request, res: Response) => {
    const { id, email } = req.query;
    try {
        let userRes;
        if (id) {
            userRes = await pool.query('SELECT id, email, name, role, status, phone, avatar FROM users WHERE id = $1', [id]);
        } else if (email) {
            userRes = await pool.query('SELECT id, email, name, role, status, phone, avatar FROM users WHERE email = $1', [email]);
        } else {
            return res.status(400).json({ message: 'Thiếu id hoặc email' });
        }
        if (userRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy user' });
        res.json(userRes.rows[0]);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ message: 'Lỗi server', error: err });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id, name, role, status, phone, avatar } = req.body;
    try {
        if (!id) return res.status(400).json({ message: 'Thiếu id user' });
        const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy user' });
        await pool.query(
            'UPDATE users SET name = $1, role = $2, status = $3, phone = $4, avatar = $5 WHERE id = $6',
            [
                name ?? userRes.rows[0].name,
                role ?? userRes.rows[0].role,
                status ?? userRes.rows[0].status,
                phone ?? userRes.rows[0].phone,
                avatar ?? userRes.rows[0].avatar,
                id
            ]
        );
        res.json({ message: 'Cập nhật user thành công' });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ message: 'Lỗi server', error: err });
    }
}; 