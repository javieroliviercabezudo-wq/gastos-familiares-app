import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fn = require('./netlify/functions/dashboard.js');

(async () => {
  const result = await fn.handler({ queryStringParameters: { month: '5', year: '2026' } });
  console.log('Status:', result.statusCode);
  console.log('Body:', JSON.stringify(JSON.parse(result.body), null, 2));
})();
