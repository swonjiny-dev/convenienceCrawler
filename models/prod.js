const db = require('../schema/index');
const moment = require('moment');
const logger = require('../utils/logger');

class ProdModel{
  /**
   * 상품정보목록조회
   * @return {Promise.<boolean>}
   */
  static async getProdList(brand , category , eventType , title){
    const prodList = {list : "prodlist"};
    return prodList;
  }

  /**
   * 상품정보 브랜드별 대량 입력
   * @param list 상품목록
   * @return boolean
   */
  static async createProdList(list){
    try {
      await db.Product.bulkCreate(list);
      return true
    } catch (error) {
      logger.error(error);
      return false
    }
  }

   /**
   * 상품정보 브랜드별 삭제 
   * @param brand 브랜드명
   * @param date 삭제할 시간
   * @return boolean
   */
  static async removeProdBrand(brand){
    try {
      let date = moment().subtract(60, 'minute').format('YYYY-MM-DD HH:mm:ss');
      await db.sequelize.query(
        `DELETE FROM tb_products WHERE brand = '${brand}' AND createdAt < '${date}'`
      )
    } catch (error) {
      logger.error(error);
      return false;
    }
    return true;
  }

   /**
   * 상품정보 확인후 변경하기
   * @param {String} brand 브랜드
   * @param {String} title 상품이름
    * @return Promise.<object(Product)>
   */
  static async dbCategory(brand, title){
    try {
      return await db.Product.findOne({
        where : {
          brand,
          title
        }
      })
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * 상품정보 단건 입력
   * @return {Promise.<boolean>}
   */
  // static async createProd(){
  //   return true
  // }

  /**
   * 상품정보 단건 삭제
   */
  // static async removeProd(){
  //   return true;
  // }

 

}

module.exports = ProdModel;