const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy API requests to Laravel backend
  app.use(
    ['/api', '/proxy'],
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      ws: true,
      secure: false,
      logLevel: 'silent',
    })
  );
};
