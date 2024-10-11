const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');

setHeadlessWhen(process.env.HEADLESS);
setCommonPlugins();

exports.config = {
  tests: './src/test/java/com/koipond/backend/api/*_test.js',
  output: './test-results',
  helpers: {
    REST: {
      endpoint: 'http://localhost:8080/api',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
    JSONResponse: {}
  },
  include: {},
  name: 'KOI-POND-BACKEND'
};
