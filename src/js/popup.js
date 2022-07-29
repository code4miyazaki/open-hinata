export function popUp(layers,features,overlay,evt,content) {
  let cont
  const coordinate = evt.coordinate;
  switch (layers[0].values_.id) {
    // 小学校区
    case 'syougakkouku':
      cont = '市区町村コード＝' + features[0].properties_.A27_005 + '<br>' +
                  '設置主体=' + features[0].properties_.A27_006+ '<br>' +
                  '名称＝' + features[0].properties_.A27_007+ '<br>' +
                  '所在地＝' + features[0].properties_.A27_008+ '<br>'
      break;
    // 中学校区
    case 'tyuugakkouku' :
      cont = '市区町村コード＝' + features[0].properties_.A32_006 + '<br>' +
                  '設置主体=' + features[0].properties_.A32_007 + '<br>' +
                  '名称＝' + features[0].properties_.A32_008 + '<br>' +
                  '所在地＝' + features[0].properties_.A32_009 + '<br>'
       break;
     // 夜の明かり
    case 'japanLight':
      cont = '明るさレベル＝' +  features[0].properties_.light
      break
  }
  content.innerHTML = cont
  if (cont) overlay.setPosition(coordinate);




}
