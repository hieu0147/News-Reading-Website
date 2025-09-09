import { Request, Response } from 'express';
import { UserModel } from '../models/user';

export class UserController {
    private userModel: UserModel;
    constructor() {
        this.userModel = new UserModel();
    }

    async createUser(req: Request, res: Response) {
        try {
            const user = await this.userModel.createUser(req.body);
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi thêm người dùng' });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await this.userModel.updateUser(id, req.body);
            if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi sửa người dùng' });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const ok = await this.userModel.deleteUser(id);
            if (!ok) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi xóa người dùng' });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await this.userModel.getAll();
            const total = await this.userModel.getTotalCount();
            res.json({ success: true, data: users, total });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách người dùng' });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await this.userModel.findById(id);
            if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi lấy người dùng' });
        }
    }
} 