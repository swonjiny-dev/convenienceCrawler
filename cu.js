/**
 * cu 편의점 플러스 상품 정보 수집
 * @since 2020.05
 * @author swonjiny.dev@gmail.com
 */
const ProdController = require('./controllers/prod');
const ClassificationController = require('./controllers/classification');
const puppeteer = require('puppeteer');
const link = "http://cu.bgfretail.com/event/plus.do?category=event";
const logger = require('./utils/logger');

const crawler = async(classifier)=>{
  try {
    logger.info('cu 시작')
    const browser = await puppeteer.launch({
        headless : true, 
        devtools : false
    }); // 배포시 주의 headless true devtools false 변경
    const page = await browser.newPage();
    await page.goto(link , 
      {waitUntil: 'networkidle0'} //  옵션은 조정하면서 확인 - 공식문서를 봐도 이해가 안되는 부분
    );
    // 더보기 버튼 클릭
    let condition = true;
    while (condition) {
      const addBtn = await page.$('.prodListBtn a');      
      if(addBtn){
        await page.evaluate((btn) => btn.click(), addBtn); 
        await page.waitForFunction(`document.querySelector('.AjaxLoading').style.display==='none'`);
        await page.waitFor(1000);
        condition = true;
      }else{
        condition = false;
      }
    }

    //상품정보추출
    let list = await page.evaluate( async () => {
      let prodList = [];
     
      const priceArr = document.querySelectorAll('.prodListWrap ul p.prodPrice span');
      const imageArr = document.querySelectorAll('.prodListWrap ul .photo a img');
      const titleArr = document.querySelectorAll('.prodListWrap ul p.prodName a');
      const eventArr = document.querySelectorAll('.prodListWrap ul ul');
      
      for (let i = 0; i < priceArr.length; i++) {
        const prod = {brand : 'cu', price : '' , imageUrl : '' , title : '' , eventType : '' ,category : '음료'};
        const category = {title : '', category : '음료'}
        prod.price = priceArr[i].innerText.replace(",",'');
        prod.imageUrl = imageArr[i].src;
        prod.title = titleArr[i].innerText;
        category.title = titleArr[i].innerText;
        prod.eventType = eventArr[i].querySelector('li').innerText;
      
         prodList.push(prod);
      }

      // 중복제거
      prodList = Array.from(new Set(prodList.map(JSON.stringify))).map(JSON.parse);
      prodList = prodList.map((item)=>{
        if(item.eventType==='3+1') item.eventType = 'n+1';
        return item;
      })
      return Promise.resolve(prodList);
          
    });
   
    // 오늘자 수집 정보를 입력한다
    // 카테고리정보 처리
    // 분류기는 다양한 방식으로 정확도 높이기 개발이 진행중이다
    list = await ClassificationController.categoryMake(list,classifier);
    // 분류기정보가 아직 부정확 하기에 기존의 카테고리가 존재한다. 해당 카테고리로 대체 

    list = await Promise.all( list.map( async(item)=>{
      const prod = await ProdController.dbCategory(item.brand , item.title);
      if(prod) {
        item.category = prod.category;
      }
      return item
    }))
    
    await ProdController.createProdList(list);
    await ProdController.removeProdBrand('cu');
    logger.info('cu 상품입력 마무리')
    await page.close();
    await browser.close();
  } catch (error) {
    logger.error('cu crawler :'+error)
  }
}

module.exports = {crawler};
