import * as cron from 'node-cron';
import { RssScraper } from './rssScraper';

export class CronService {
    private rssScraper: RssScraper;

    constructor() {
        this.rssScraper = new RssScraper();
    }

    async initialize(): Promise<void> {
        try {
            // Khởi động cronjob
            this.startCronJobs();
            console.log('✅ Đã khởi động cronjob service (RSS)');
        } catch (error) {
            console.error('❌ Lỗi khi khởi tạo cron service:', error);
        }
    }

    private startCronJobs(): void {
        // Chạy mỗi 1 phút (hoặc 30 phút tuỳ chỉnh)
        cron.schedule('*/30 * * * *', async () => {
            console.log('⏰ Cronjob chạy - Thu thập dữ liệu từ RSS Tuổi Trẻ');
            await this.rssScraper.scrapeAllFeeds();
        }, {
            timezone: "Asia/Ho_Chi_Minh"
        });

        // Chạy ngay khi khởi động (tùy chọn)
        // this.rssScraper.scrapeAllFeeds();
    }

    // Hàm để chạy thủ công
    async runScrapingManually(): Promise<void> {
        console.log('🔄 Chạy thu thập dữ liệu RSS thủ công...');
        await this.rssScraper.scrapeAllFeeds();
    }

    // Hàm để dừng tất cả cronjobs
    stopAllCronJobs(): void {
        cron.getTasks().forEach(task => task.stop());
        console.log('⏹️ Đã dừng tất cả cronjobs');
    }
} 