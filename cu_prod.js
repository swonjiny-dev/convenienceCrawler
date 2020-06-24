/**
 * cu 편의점 플러스 상품 정보 수집 - 상품카테고리정보 학습용데이터로 사용
 * @since 2020.05
 * @author swonjiny.dev@gmail.com
 */
const logger = require('./utils/logger');
const cController = require('./controllers/classification');
const puppeteer = require('puppeteer');
const link = [
  "http://cu.bgfretail.com/product/product.do?category=product&depth2=5&depth3=1",// 간편식
  "http://cu.bgfretail.com/product/product.do?category=product&depth2=5&depth3=2",// 즉석요리
  "http://cu.bgfretail.com/product/product.do?category=product&depth2=5&depth3=3",// 과자류
  "http://cu.bgfretail.com/product/product.do?category=product&depth2=5&depth3=4",// 아이스크림
  "http://cu.bgfretail.com/product/product.do?category=product&depth2=5&depth3=5",// 식품
  "http://cu.bgfretail.com/product/product.do?category=product&depth2=5&depth3=6",// 음료
  "http://cu.bgfretail.com/product/product.do?category=product&depth2=5&depth3=7",// 생활용품
];

// 더보기 버튼 클릭
const addBtn = async(page)=>{
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
}

const crawler = async()=>{
  try {
    logger.debug('cu 상품정보 시작');
    const browser = await puppeteer.launch({
        headless : true, 
        devtools : false
    }); // 배포시 주의 headless true devtools false 변경
    const page = await browser.newPage();
    for (let i = 0; i < link.length; i++) {
      await page.goto(link[i] , 
        {waitUntil: 'networkidle0'} //  옵션은 조정하면서 확인 - 공식문서를 봐도 이해가 안되는 부분
      );
      // 더보기 버튼 계속 클릭실행
      await addBtn(page);
       // 상품정보 추출
      let list = await page.evaluate(async () => {
        let prodList = [];
        let category =document.querySelector('h1').innerText;      
        const titleArr = document.querySelectorAll('.prodName span');
        for (let i = 0; i < titleArr.length; i++) {
          const prod = {title : titleArr[i].innerText , category : category};
          prodList.push(prod);
        }
        
        return Promise.resolve(prodList);
      });
      // 중복제거
      logger.debug(list);
      list = await Array.from(new Set(list.map(JSON.stringify))).map(JSON.parse);
      // 카테고리 정보 입력
      list = await cController.createList(list);
    }
   
    await page.close();
    await browser.close();
  } catch (error) {
    logger.error('cu error '+error)
  }
}

crawler();