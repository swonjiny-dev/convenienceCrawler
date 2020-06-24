const CategoryModel = require('../models/category');
const logger = require('../utils/logger');
class ClassificationController{
  // 카테고리용 학습데이터 입력
  static async createList(list){
    return await CategoryModel.createCatrgotyBulk(list);
  }

  // 카테고리 정보 학습
  static async categoryInit(){
    logger.info('ClassificationController : 베이지안 학습 ');
    return await CategoryModel.categoryInit();
  }

  // 카테고리정보 변환
  static async categoryMake(list , classifier){
    for (let i = 0; i < list.length; i++) {
      list[i].category = await classifier.categorize(list[i].title);
      
    }

    return list;
  }
}

module.exports = ClassificationController;