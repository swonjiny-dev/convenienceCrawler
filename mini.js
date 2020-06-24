/**
 * 미니스톱 편의점 플러스 상품 정보 수집-cros 제한이 없어서 api 호출
 * @since 2020.05
 * @author swonjiny.dev@gmail.com
 */
const ProdController = require('./controllers/prod');
const ClassificationController = require('./controllers/classification');
const logger = require('./utils/logger');
const puppeteer = require('puppeteer');
const link = [
  "https://www.ministop.co.kr/MiniStopHomePage/page/event/plus1.do",//1+1
  "https://www.ministop.co.kr/MiniStopHomePage/page/event/plus2.do",//2+1
  "https://www.ministop.co.kr/MiniStopHomePage/page/event/plus4.do",//n+1
  "https://www.ministop.co.kr/MiniStopHomePage/page/event/sale.do",// 가격할인
]

const crawler = async(classifier)=>{
  try {
    logger.info('미니스톱 시작');
    let prodList = [];
    const browser = await puppeteer.launch({
        headless : true, 
        devtools : false
    }); // 배포시 주의 headless true devtools false 변경
    const page = await browser.newPage();
    // 1+1 상품수집
    await page.goto(link[0] , 
      {waitUntil: 'networkidle0'} //  옵션은 조정하면서 확인 - 공식문서를 봐도 이해가 안되는 부분
    );
    // 더보기 버튼 클릭
    for (let i = 0; i < 100; i++) {
      const addBtn = await page.$('.pr_more');      
      if(addBtn){
        await page.evaluate((btn) => btn.click(), addBtn); 
        await page.waitFor(1000); // waitFor 관련된 부분 확인 필요 이해부족함
      }else{
        break;
      }
    }
    // 상품정보추출
    const list_1 = await page.evaluate( () => {
      const elList = document.querySelectorAll('.event_plus_list li');
      const prodArr = Array.from(elList).map((el)=>{
        return {
          brand : 'mini', 
          price : el.querySelector('strong').innerText.replace('원','').replace(',','') , 
          imageUrl : el.querySelector('img').src, 
          title : el.querySelector('img').alt, 
          eventType : el.querySelector('.plus11').innerText,
          category : '음료'
        }
      });
      return Promise.resolve(prodArr);
    });
    prodList = prodList.concat(list_1);

    // 2+1
    await page.goto(link[1] , 
      {waitUntil: 'networkidle0'}
    );
    // 더보기 버튼 클릭
    for (let i = 0; i < 100; i++) {
      const addBtn = await page.$('.pr_more');      
      if(addBtn){
        await page.evaluate((btn) => btn.click(), addBtn); 
        await page.waitFor(2000);
      }else{
        break;
      }
    }

    const list_2 = await page.evaluate( () => {
      const elList = document.querySelectorAll('.event_plus_list li');
      const prodArr = Array.from(elList).map((el)=>{
        return {
          brand : 'mini', 
          price : el.querySelector('strong').innerText.replace('원','').replace(',','') , 
          imageUrl : el.querySelector('img').src, 
          title : el.querySelector('img').alt, 
          eventType : el.querySelector('.plus11').innerText,
          category : '음료'
        }
      });
      return Promise.resolve(prodArr);
    });
    prodList = prodList.concat(list_2);

    // n+1
    await page.goto(link[2] , 
      {waitUntil: 'networkidle0'} 
    );
    // 더보기 버튼 클릭
    for (let i = 0; i < 100; i++) {
      const addBtn = await page.$('.pr_more');      
      if(addBtn){
        await page.evaluate((btn) => btn.click(), addBtn); 
        await page.waitFor(2000); 
      }else{
        break;
      }
    }

    const list_3 = await page.evaluate( () => {
      const elList = document.querySelectorAll('.event_plus_list li');
      const prodArr = Array.from(elList).map((el)=>{
        return {
          brand : 'mini', 
          price : el.querySelector('strong').innerText.replace('원','').replace(',','') , 
          imageUrl : el.querySelector('img').src, 
          title : el.querySelector('img').alt, 
          eventType : el.querySelector('.plus11').innerText,
          category : '음료'
        }
      });
      return Promise.resolve(prodArr);
    });
    prodList = prodList.concat(list_3);
    await page.waitFor(1000);
    // 중복제거 -- 웹구조상 안보이는 영역에 상품정보가 생성되어 있는 경우가 있음
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
    await ProdController.removeProdBrand('mini');
    await page.close();
    await browser.close();

  } catch (error) {
    logger.error('mini crawler :'+error);
  }
}

module.exports = {crawler};