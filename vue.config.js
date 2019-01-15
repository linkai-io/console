const path = require('path');

function resolveSrc(_path) {
  return path.join(__dirname, _path);
}
// vue.config.js
module.exports = {
  lintOnSave: true,
  configureWebpack: {
    // Set up all the aliases we use in our app.
    resolve: {
      alias: {
        src: resolveSrc('src'),
        assets: resolveSrc('src/assets')
      }
    },
    devServer: {
      proxy: {
        '/org': {
          target: 'http://localhost:3000/org',
          logLevel: 'debug'
        },
        '/scangroup': {
          target: 'http://localhost:3000/',
          logLevel: 'debug'
        },
        '/user': {
          target: 'http://localhost:3000/',
          logLevel: 'debug'
        },
        '/address': {
          target: 'http://localhost:3000/',
          logLevel: 'debug'
        }
      }
    }
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  css: {
    // Enable CSS source maps.
    sourceMap: true
  }
};
