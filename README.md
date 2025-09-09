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
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### 3. Khởi động server
```bash
npm run dev
```

## Tài liệu API
- Truy cập Swagger UI tại: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)