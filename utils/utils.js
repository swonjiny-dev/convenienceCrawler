// 딜레이 
const delay = (timeout)=>{
  return new Promise((resolve)=>{
    setTimeout( resolve, timeout );
  })
}

//

module.exports = {delay}