const db = require('../schema/index');
const logger =require('../utils/logger');
const bayes = require('bayes');

class CategoryModel{
  /**
   * 상품정보 브랜드별 대량 입력
   * @param list 내용 카테고리
   * @return boolean
   */
  static async createCatrgotyBulk(list){
    try {
      logger.info('상품명-카테고리정보 벌크입력');
      await db.Category.bulkCreate(list);
      return true;
    } catch (error) {
      logger.error(error)
      return false;
    }
  }

  /**
   * 상품정보 브랜드별 단건 입력
   * @param content 상품내용
   * @param category 카테고리
   * @return boolean
   */
  static async createCatrgoty(content, category){
    try {
      logger.info('상품명-카테고리정보 단건입력');
      await db.Category.Create(list);
      return true;
    } catch (error) {
      logger.error(error)
      return false;
    }
  }

  /**
   * 상품정보 학습
   * @return <List>
   */
  static async categoryInit(){
    try {
      logger.info('상품명-카테고리정보 분류정보');
      const classifier = bayes();
      const list = await db.Category.findAll();
      
      for (const cate of list) {
        await classifier.learn( cate.title , cate.category);
      }
      return classifier;
    } catch (error) {
      logger.error(error)
      return null;
    }
  }
}

module.exports = CategoryModel;