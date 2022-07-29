export function popUp(layers,features,overlay,evt,content) {
  let cont
  const coordinate = evt.coordinate;
  switch (layers[0].get('name') ) {
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
export function popUpShinsuishin(overlay,evt,content,rs,gs,bs) {
  let cont
  if(rs.substr(0,2)==="25" && gs.substr(0,2)==="25" && bs.substr(0,2)==="18") {
    cont = "0.3m未満"
  }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="24" && bs.substr(0,2)==="17") {
    cont = "0.3〜0.5m"
  }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="22" && bs.substr(0,2)==="17") {
    cont = "0.5〜1.0m"
  }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="21" && bs.substr(0,2)==="19") {
    cont = "1.0〜3.0m"
  }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="24" && bs.substr(0,2)==="16") {
    cont = "0.5m未満"
  }else if(rs.substr(0,2)==="25" && gs.substr(0,2)==="21" && bs.substr(0,2)==="19") {
    cont = "0.5〜3.0m"
  }else if(rs.substr(0,2)==="25" && gs.substr(0,2)==="18" && bs.substr(0,2)==="18") {
    cont = "3.0〜5.0m"
  }else if(rs.substr(0,2)==="25" && gs.substr(0,2)==="14" && bs.substr(0,2)==="14") {
    cont = "5.0〜10.0m"
  }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="13" && bs.substr(0,2)==="20") {
    cont = "10.0〜20.0m"
  }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="24" && bs.substr(0,2)==="17") {
    cont = "20.0m以上"
  }
  const coordinate = evt.coordinate;
  content.innerHTML = cont
  overlay.setPosition(coordinate);
}
