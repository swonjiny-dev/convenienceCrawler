/**
 * gs 편의점 플러스 상품 정보 수집
 * @since 2020.05
 * @author swonjiny.dev@gmail.com
 */

const ProdController = require('./controllers/prod');
const ClassificationController = require('./controllers/classification');
const puppeteer = require('puppeteer');
const link = "http://gs25.gsretail.com/gscvs/ko/products/event-goods";
const logger = require('./utils/logger');

const crawler = async(classifier)=>{
  try {
    logger.info('gs 시작');
    let prodList = [];
    const browser = await puppeteer.launch({
        headless : true, 
        devtools : false
    }); // 배포시 주의 headless true devtools false 변경
    const page = await browser.newPage();
    await page.goto(link , 
      {waitUntil: 'networkidle0'} //  옵션은 조정하면서 확인 - 공식문서를 봐도 이해가 안되는 부분
    );
    // 전체 선택
    const totalBtn = await page.$('#TOTAL');
    if(totalBtn){      
      await page.evaluate((btn) => btn.click(), totalBtn); 
    }
    await page.waitFor(2000);
    for (let i = 0; i < 200; i++) {
      const list = await page.evaluate( async () => {
        const noImg = "http://gs25.gsretail.com/_ui/desktop/common/images/gscvs/products/prd_no_img.gif";
        const divList = document.querySelectorAll('ul.prod_list .prod_box');
        
        const prodArr = Array.from(divList).map((el)=>{
            return {
              brand : 'gs', 
              price : el.querySelector('.cost').innerText.replace('원','').replace(',','') , 
              imageUrl : el.querySelector('img')? el.querySelector('img').src : noImg, 
              title : el.querySelector('p.tit').innerText, 
              eventType : el.querySelector('p.flg01 span').innerText,
              category : '음료'
            }
        });
        return Promise.resolve(prodArr);
      });
      prodList = prodList.concat(list)
      await page.waitFor(1000);
      await page.waitForFunction(`!document.querySelector('.blockUI.blockMsg.blockPage')`)
      await page.waitFor(1000);
      
      const flag = await page.evaluate( () => {
        // 다음 페이지 이동처리
        const nextBtn = document.querySelectorAll('.next')[4];
        if(nextBtn.getAttribute('onclick')){
          nextBtn.click();
          return true;
        }else{
          return false;
        }
      });
      if(!flag) break;
    }
  
    await page.close();
    await browser.close();

    prodList = Array.from(new Set(prodList.map(JSON.stringify))).map(JSON.parse);
    prodList = await ClassificationController.categoryMake(prodList,classifier);
    prodList = await Promise.all( prodList.map( async(item)=>{
      const prod = await ProdController.dbCategory(item.brand , item.title);
      if(prod) {
        item.category = prod.category;
      }
      return item
    }))
    await ProdController.createProdList(prodList);
    await ProdController.removeProdBrand('gs');
    logger.info('gs 상품입력 마무리')
  } catch (error) {
    logger.error('gs crawler :'+error)
    
  }
}

module.exports = {crawler};