import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { ArticleModel } from '../models/article';
import { CategoryModel } from '../models/category';
import slugify from 'slugify';

const RSS_FEEDS = [
    { url: 'https://tuoitre.vn/rss/cong-nghe.rss', name: 'Công nghệ', slug: 'cong-nghe' },
    { url: 'https://tuoitre.vn/rss/kinh-doanh.rss', name: 'Kinh doanh', slug: 'kinh-doanh' },
    { url: 'https://tuoitre.vn/rss/khoa-hoc.rss', name: 'Khoa học', slug: 'khoa-hoc' },
    { url: 'https://tuoitre.vn/rss/song-khoe.rss', name: 'Sức khỏe', slug: 'suc-khoe' },
    { url: 'https://tuoitre.vn/rss/the-thao.rss', name: 'Thể thao', slug: 'the-thao' },
    { url: 'https://tuoitre.vn/rss/tuoi-tre-cuoi-tuan.rss', name: 'Giải trí', slug: 'giai-tri' },
];

export class RssScraper {
    private articleModel: ArticleModel;
    private categoryModel: CategoryModel;
    private parser: XMLParser;

    constructor() {
        this.articleModel = new ArticleModel();
        this.categoryModel = new CategoryModel();
        this.parser = new XMLParser({ ignoreAttributes: false });
    }

    async scrapeAllFeeds(): Promise<void> {
        for (const feed of RSS_FEEDS) {
            await this.scrapeFeed(feed.url, feed.name, feed.slug);
        }
    }

    async scrapeFeed(feedUrl: string, categoryName: string, categorySlug: string): Promise<void> {
        try {
            const res = await axios.get(feedUrl, { timeout: 10000 });
            const xml = res.data;
            const json = this.parser.parse(xml);
            const items = json.rss.channel.item;
            if (!items) return;

            // Đảm bảo category tồn tại
            const category = await this.categoryModel.createIfNotExists(categoryName, categorySlug);

            for (const item of items) {
                const title = item.title;
                const link = item.link;
                const description = item.description || '';
                const pubDate = item.pubDate ? new Date(item.pubDate) : undefined;
                const thumbnail = item['media:content']?.['@_url'] || item.enclosure?.['@_url'] || '';
                const slug = slugify(title, { lower: true, strict: true });

                // Kiểm tra trùng slug
                const existed = await this.articleModel.findBySlug(slug);
                if (existed) continue;

                await this.articleModel.create({
                    title,
                    slug,
                    content: description,
                    thumbnail,
                    published_at: pubDate,
                    category_id: category.id,
                });
                console.log(`💾 Đã lưu bài viết mới: ${title}`);
            }
        } catch (err) {
            console.error(`❌ Lỗi khi lấy RSS ${feedUrl}:`, err);
        }
    }
} 