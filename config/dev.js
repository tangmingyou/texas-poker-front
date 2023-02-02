const target = 'http://localhost:9999';

module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
  },
  mini: {},
  h5: {
    devServer: {
      //host: '0.0.0.0',
      //host: '192.168.110.53',
      host: '192.168.3.102',
      port: 10086,
      // 设置代理来解决 H5 请求的跨域问题
      proxy: {
        '/api': {
          target,
          changeOrigin: true
        }
      }
    }
  }
}
