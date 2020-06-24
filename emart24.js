/**
 * emart24 편의점 플러스 상품 정보 수집-cros 제한이 없어서 api 호출
 * @since 2020.05
 * @author swonjiny.dev@gmail.com
 */

const ProdController = require('./controllers/prod');
const ClassificationController = require('./controllers/classification');
const puppeteer = require('puppeteer');
const link = 'https://emart24.co.kr/product/eventProduct.asp';
const logger = require('./utils/logger');
// 탭버튼
const tabClick = async(page, num)=>{
  await page.evaluate((num) => {
    const tabBtn = document.querySelectorAll('ul.tab01 a');
    if(tabBtn)  tabBtn[num].click();
  } , num);
  await page.waitForSelector('.paging');
}

// 다음버튼선택
const nextClick = async(page)=>{
  const nextBtn =await page.$('a.next');  
  if(nextBtn){
    const aHrefText = await page.evaluate(a => a.getAttribute('href'), nextBtn);
    if(aHrefText.indexOf('#none')===-1){
      await page.click('a.next');
      await page.waitForSelector('.paging');
      return Promise.resolve(true);
    }else return Promise.resolve(false);
  }else return Promise.resolve(false);
}

// 상품정보 추출
const prodExtract = (page, elList , brand , eventType)=>{  
  const result = page.evaluate( async(elstr,brand,eventType) => {    
    const elList = document.querySelectorAll(elstr);
    if(elList[0].className === 'nodata') return [];
    const prodArr = Array.from(elList).map((el)=>{
      return {
        brand, 
        price : el.querySelector('.price').innerText.replace(/(원|,)/g,'').trim(), 
        imageUrl : el.querySelector('p.productImg img').src, 
        title : el.querySelector('p.productImg img').alt, 
        eventType,
        category : '음료'
      }
    });
    return prodArr;
  },elList,brand,eventType);
  return Promise.resolve(result);;
}

const crawler = async(classifier)=>{
  try {
    logger.info('emart24 시작')
    let prodList = [];
    const browser = await puppeteer.launch({
      headless : true, 
      devtools : false
    }); // 배포시 주의 headless true devtools false 변경
    const page = await browser.newPage();
    await page.goto(link, {waitUntil: 'networkidle0'});
    // 1+1
    await tabClick(page, 1);
    let condition = true;
    while (condition) {
      const list = await prodExtract(page , 'ul.categoryListNew li' , 'emart24' , '1+1');
      prodList = prodList.concat(list);
      condition = await nextClick(page);
      await page.waitFor(1000);
    }
    // 1+2
    await tabClick(page, 2);
    condition = true;
    while (condition) {
      const list = await prodExtract(page , 'ul.categoryListNew li' , 'emart24' , '2+1');
      prodList = prodList.concat(list);
      condition = await nextClick(page);
      await page.waitFor(1000);
    }

    // 1+n
    await tabClick(page, 3);
    condition = true;
    while (condition) {
      const list = await prodExtract(page , 'ul.categoryListNew li' , 'emart24' , 'n+1');
      prodList = prodList.concat(list);
      condition = await nextClick(page);
      await page.waitFor(1000);
    }
    // 중복제거
    prodList = Array.from(new Set(prodList.map(JSON.stringify))).map(JSON.parse);
    // 카테고리정보 처리
    prodList = await ClassificationController.categoryMake(prodList,classifier);

    prodList = await Promise.all( prodList.map( async(item)=>{
      const prod = await ProdController.dbCategory(item.brand , item.title);
      if(prod) {
        item.category = prod.category;
      }
      return item
    }))
    // 입력
    await ProdController.createProdList(prodList);  
    await ProdController.removeProdBrand('emart24');
    logger.info('emart24 상품입력 마무리')
    await page.close();
    await browser.close();
  } catch (error) {
    logger.error('emart24 - crawler :'+error)
  }
}

module.exports = {crawler};