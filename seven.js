/**
 * 세븐일레븐 편의점 플러스 상품 정보 수집
 * @since 2020.05
 * @author swonjiny.dev@gmail.com
 */

const ProdController = require('./controllers/prod');
const ClassificationController = require('./controllers/classification');
const puppeteer = require('puppeteer');
const link = "http://www.7-eleven.co.kr/product/presentList.asp";
const logger = require('./utils/logger');

// 상품정보 추출
const prodExtract = (page, elList , brand , eventType)=>{  
  const result = page.evaluate( async(elstr,brand,eventType) => {    
    const elList = document.querySelectorAll(elstr);
    const prodArr = Array.from(elList).map((el)=>{
      return {
        brand, 
        price : el.querySelector('.price').innerText.replace(',','') , 
        imageUrl : el.querySelector('img').src, 
        title : el.querySelector('img').alt, 
        eventType,
        category : '음료'
      }
    });
    return prodArr;
  },elList,brand,eventType);
  return Promise.resolve(result);;
}

// 탭버튼 작동
const tabClick = async(page, num)=>{
  await page.evaluate( (num) => {
    const tabBtn = document.querySelectorAll('ul.tab_layer li a');
    if(tabBtn)  tabBtn[num].click();
  } , num);
  await page.waitForSelector('li.btn_more a');
}

// 더보기 버튼 작동
// 화면이 비동기로 html 을 받아오지만 화면을 ...... 리프레시 등등의 문제가 많은 사이트
const addClick = async(page)=>{
  for (let i = 0; i < 100; i++) {
    const addBtn = await page.$('li.btn_more a');
    if(addBtn) {
      await page.evaluate((btn) => btn.click(), addBtn); 
      await page.waitFor(2000);
    }else break;
  } 
}

const crawler = async(classifier)=>{
  try {
    logger.info('세븐일레븐 시작')
    let prodList = [];
    const browser = await puppeteer.launch({
        headless : true, 
        devtools : false
    }); // 배포시 주의 headless true devtools false 변경
    const page = await browser.newPage();
    await page.goto(link ,{waitUntil: 'networkidle0'});
    await page.waitFor(2000);
    // 1+1 상품정보
    await addClick(page);
    const list1 = await prodExtract(page , 'ul#listUl .pic_product' , 'seven' , '1+1');
    // 1+2 상품정보
    await tabClick(page, 1);
    await addClick(page);
    const list2 = await prodExtract(page , 'ul#listUl .pic_product' , 'seven' , '2+1');
    // 덤상품추가
    await tabClick(page, 2);
    await addClick(page);
    const list3 = await prodExtract(page , 'ul#listUl .pic_product' , 'seven' , '덤증정행사');
    // 할인
    await tabClick(page, 3);
    await addClick(page);
    const list4 = await prodExtract(page , 'ul#listUl .pic_product' , 'seven' , '가격할인');

    prodList = prodList.concat(list1);
    prodList = prodList.concat(list2);
    prodList = prodList.concat(list3);
    prodList = prodList.concat(list4);
  
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
    await ProdController.removeProdBrand('seven');
    logger.info('세븐일레븐 상품입력 마무리');

    await page.close();
    await browser.close();
  } catch (error) {
    logger.error('세븐일레븐 crawler :'+error)
    
  }
}

module.exports = {crawler};