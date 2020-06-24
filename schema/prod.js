module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('tb_product',{
    brand : {
      type: DataTypes.STRING,
      allowNull: false,
      comment : '브랜드'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment : '상품명'
    },
    price : {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment : '판매가격'
    },
    imageUrl : {
      type: DataTypes.STRING,
      allowNull: true,
      comment : '이미지 URL'
    },
    eventType : {
      type: DataTypes.STRING,
      allowNull: false,
      comment : '1+1 1+2 구분'
    },
    category : {
      type: DataTypes.STRING,
      allowNull: false,
      comment : '음료 간편식 기타'
    }
  },
  {
    indexes : [
      { 
        name : 'idx_product_title',
        fields:['title']
      },
      { 
        name : 'idx_product_eventType',
        fields:['eventType']
      },
      {   
        name : 'idx_product_category',
        fields:['category']
      },
      {   
        name : 'idx_product_brand',
        fields:['brand']
      },
    ]
  }, 
  {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
  }
  );  
  return Product;
};