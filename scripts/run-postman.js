const { runPostmanCollection } = require('../src/integrations/postman');

(async () => {
  try {
    const summary = await runPostmanCollection('./postman/sample.postman.json', './postman/sample-env.postman.json');
    console.log('Postman test run completed:', summary.run.stats);
  } catch (err) {
    console.error('Postman test run failed:', err);
    process.exit(1);
  }
})();
