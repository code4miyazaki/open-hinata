import store from './store'
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
//----------------------------------------------------------------------------------------
export function popUpShinsuishin(map,overlay,evt,content,overlap) {
  const url = 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin/';
  let z = Math.floor(eval(map).getView().getZoom());
  if(z>17) z=17;
  const R = 6378137;// 地球の半径(m);
  const rx = (0.5 + evt.coordinate[0]/(2*R*Math.PI))*Math.pow(2,z);
  const ry = (0.5 - evt.coordinate[1]/(2*R*Math.PI))*Math.pow(2,z);
  const x = Math.floor(rx);// タイルX座標
  const y = Math.floor(ry);// タイルY座標
  const i= (rx - x) * 256;// タイル内i座標
  const j = (ry - y) * 256;// タイル内j座標
  const img = new Image();
  img.crossOrigin = "anonymouse";
  img.onload = function(){
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 1;
    canvas.height = 1;
    context.drawImage(img,i,j,1,1,0,0,1,1);
    const data = context.getImageData(0,0,1,1).data;
    const r = data[0];
    const g = data[1];
    const b = data[2];
    const rs = String(r);
    const gs = String(g);
    const bs = String(b);
    console.log(rs,gs,bs);
    if (r + g + b === 0) return
    const rgba = "rgba(" + r + "," + g + "," + b + ",1.0)";
    let cont
    if(rs.substr(0,2)==="25" && gs.substr(0,2)==="25" && bs.substr(0,2)==="18") {
      cont = "洪水浸水深　0.3m未満"
    }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="24" && bs.substr(0,2)==="17") {
      cont = "洪水浸水深　0.3〜0.5m"
    }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="22" && bs.substr(0,2)==="17") {
      cont = "洪水浸水深　0.5〜1.0m"
    }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="21" && bs.substr(0,2)==="19") {
      cont = "洪水浸水深　1.0〜3.0m"
    }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="24" && bs.substr(0,2)==="16") {
      cont = "洪水浸水深　0.5m未満"
    }else if(rs.substr(0,2)==="25" && gs.substr(0,2)==="21" && bs.substr(0,2)==="19") {
      cont = "洪水浸水深　0.5〜3.0m"
    }else if(rs.substr(0,2)==="25" && gs.substr(0,2)==="18" && bs.substr(0,2)==="18") {
      cont = "洪水浸水深　3.0〜5.0m"
    }else if(rs.substr(0,2)==="25" && gs.substr(0,2)==="14" && bs.substr(0,2)==="14") {
      cont = "洪水浸水深　5.0〜10.0m"
    }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="13" && bs.substr(0,2)==="20") {
      cont = "洪水浸水深　10.0〜20.0m"
    }else if(rs.substr(0,2)==="24" && gs.substr(0,2)==="24" && bs.substr(0,2)==="17") {
      cont = "洪水浸水深　20.0m以上"
    }
    const coordinate = evt.coordinate;
    if (overlap) {
      store.commit('base/popUpContUpdate',cont)
    } else {
      content.innerHTML = cont
      if (cont) overlay.setPosition(coordinate);
    }
  }
 const imgSrc = url + z + '/' + x + '/' + y+ ".png";
 img.src = imgSrc;
}
//----------------------------------------------------------------------------------------
export function popUpTunami(map,overlay,evt,content,overlap) {
  const url = 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_oldlegend/';
  let z = Math.floor(eval(map).getView().getZoom());
  if(z>14) z=14;
  const R = 6378137;// 地球の半径(m);
  const rx = (0.5 + evt.coordinate[0]/(2*R*Math.PI))*Math.pow(2,z);
  const ry = (0.5 - evt.coordinate[1]/(2*R*Math.PI))*Math.pow(2,z);
  const x = Math.floor(rx);// タイルX座標
  const y = Math.floor(ry);// タイルY座標
  const i= (rx - x) * 256;// タイル内i座標
  const j = (ry - y) * 256;// タイル内j座標
  const img = new Image();
  img.crossOrigin = "anonymouse";
  img.onload = function(){
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = 1;
    canvas.height = 1;
    context.drawImage(img,i,j,1,1,0,0,1,1);
    const data = context.getImageData(0,0,1,1).data;
    const r = data[0];
    const g = data[1];
    const b = data[2];
    const rs = String(r);
    const gs = String(g);
    const bs = String(b);
    console.log(rs,gs,bs);
    if (r + g + b === 0) return
    const rgba = "rgba(" + r + "," + g + "," + b + ",1.0)";
    let cont
    if(r===0 && g===255 && b===0) {
      cont = "津波浸水深　0.01m以上0.3m未満"
    }else if(r===255 && g===230 && b===0) {
      cont = "津波浸水深　0.3m以上1.0m未満"
    }else if(r===255 && g===153 && b===0) {
      cont = "津波浸水深　1m以上2m未満"
    }else if(r===239 && g===117 && b===152) {
      cont = "津波浸水深　2m以上5m未満"
    }else if(r===255 && g===40 && b===0) {
      cont = "津波浸水深　5m以上10m未満"
    }else if(r===180 && g===0 && b===104) {
      cont = "津波浸水深　10m以上20m未満"
    }else if(r===128 && g===0 && b===255) {
      cont = "津波浸水深　20m以上"
    }
    const coordinate = evt.coordinate;
    if (overlap) {
      store.commit('base/popUpContUpdate',cont)
    } else {
      content.innerHTML = cont
      if (cont) overlay.setPosition(coordinate);
    }
  }
  const imgSrc = url + z + '/' + x + '/' + y+ ".png";
  img.src = imgSrc;
}
