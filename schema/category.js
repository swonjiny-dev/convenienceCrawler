module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('tb_category',{
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment : '분류대상제목'
    },
    category : {
      type: DataTypes.STRING,
      allowNull: false,
      comment : '카테고리'
    }
  },
  {
    indexes : [
      {   
        name : 'idx_category_category',
        fields:['category']
      }
    ]
  }, 
  {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
  }
  );  
  return Category;
};