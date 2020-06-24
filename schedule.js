const schedule = require('node-schedule');
const logger = require('./utils/logger')
const classify = require('./controllers/classification');
const cu = require('./cu');
const gs = require('./gs');
const emart24 = require('./emart24');
const mini = require('./mini');
const seven = require('./seven');

const job = schedule.scheduleJob('0 0 1 * * *' , ()=>{
    logger.info('job 스켈줄 실행');
    try {
      const classifier = await classify.categoryInit();
      await cu.crawler(classifier); 
      await gs.crawler(classifier);
      await emart24.crawler(classifier);
      await mini.crawler(classifier);
      await seven.crawler(classifier);
    } catch (error) {
        logger.error(error)
    }
})