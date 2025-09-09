# Cronjob Service - Thu thập dữ liệu từ Tuổi Trẻ Online

## Mô tả
Hệ thống cronjob tự động thu thập bài viết từ [Tuổi Trẻ Online](https://tuoitre.vn/) mỗi 30 phút và lưu vào database.

## Tính năng
- ✅ Thu thập bài viết từ trang chủ Tuổi Trẻ Online
- ✅ Thu thập từ các chuyên mục: Thời sự, Thế giới, Kinh doanh, Công nghệ, Giải trí, Thể thao, Sức khỏe, Giáo dục
- ✅ Tự động chạy mỗi 30 phút
- ✅ Tránh lưu trùng bài viết (dựa trên source_url)
- ✅ API để quản lý bài viết
- ✅ Thống kê bài viết theo category

## Cài đặt

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình database
Đảm bảo file `.env` có cấu hình DATABASE_URL:
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password_here
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
```

### 3. Khởi động server
```bash
npm run dev
```

## Tài liệu API
- Truy cập Swagger UI tại: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)