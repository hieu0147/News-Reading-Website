import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Challenge 7 API',
            version: '1.0.0',
            description: 'API documentation for Challenge 7 project',
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Các API xác thực, đăng nhập, đăng ký...' },
            { name: 'User', description: 'Quản lý người dùng' },
            { name: 'Articles', description: 'Quản lý bài viết' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            { bearerAuth: [] }
        ],
    },
    apis: ['src/routes/*.ts', 'src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions); 