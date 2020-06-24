const logger = require('./utils/logger')
const classify = require('./controllers/classification');
const cu = require('./cu');
const gs = require('./gs');
const emart24 = require('./emart24');
const mini = require('./mini');
const seven = require('./seven')

const app = async()=>{
  logger.info('학습');
  const classifier = await classify.categoryInit();
  logger.info('학습 마무리');

  await cu.crawler(classifier); 
  await gs.crawler(classifier);
  await emart24.crawler(classifier);
  await mini.crawler(classifier);
  await seven.crawler(classifier);
}

app();