const ProdModel = require('../models/prod');
 
class ProdController{
  static async createProdList(list){
    return await ProdModel.createProdList(list);
  }
  static async removeProdBrand(brand){
    return await ProdModel.removeProdBrand(brand);
  }

  static async dbCategory(brand , title){
    return await ProdModel.dbCategory(brand , title);
  }

}

module.exports = ProdController;