// マップ関係の関数
import store from './store'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { transform, fromLonLat } from 'ol/proj'
import { ScaleLine } from 'ol/control';
import Toggle from 'ol-ext/control/Toggle'
import Target from 'ol-ext/control/Target'
import Lego from 'ol-ext/filter/Lego'
import Notification from '../js/notification'
import * as Layers from '../js/layers'
import {defaults as defaultInteractions, DragRotateAndZoom} from 'ol/interaction';
let maxZndex = 0;
let legoFilter = null;
export function initMap (vm) {
  // マップ作製ループ用の配列を作成
  const maps = [
    // {mapName: 'map01', map:store.state.base.map01, layer:store.state.base.layerLists.map01[0].layer},
    // {mapName: 'map02', map:store.state.base.map02, layer:store.state.base.layerLists.map02[0].layer},
    // {mapName: 'map03', map:store.state.base.map03, layer:store.state.base.layerLists.map03[0].layer},
    // {mapName: 'map04', map:store.state.base.map04, layer:store.state.base.layerLists.map04[0].layer}
    {mapName: 'map01', map:store.state.base.map01},
    {mapName: 'map02', map:store.state.base.map02},
    {mapName: 'map03', map:store.state.base.map03},
    {mapName: 'map04', map:store.state.base.map04}
  ];
  const view01 = new View({
    center: fromLonLat([140.097, 37.856]),
    zoom: 7
  });
  for (let i in maps) {
    // マップ作製
    const mapName = maps[i].mapName;
    const map = new Map({
      interactions: defaultInteractions().extend([
        new DragRotateAndZoom()
      ]),
      // layers: [maps[i].layer],
      target: mapName,
      view: view01
    });
    // マップをストアに登録
    store.commit('base/setMap', {mapName: maps[i].mapName, map});

    // コントロール追加---------------------------------------------------------------------------
    map.addControl(new Target({composite: 'difference'}));
    map.addControl(new ScaleLine());
    const notification = new Notification();
    map.addControl(notification);
    store.commit('base/setNotifications',{mapName:mapName, control: notification});
    //現在地取得
    const  success = (pos) =>{
      const lon = pos.coords.longitude;
      const lat = pos.coords.latitude;
      // map.getView().setCenter(transform([lon,lat],"EPSG:4326","EPSG:3857"));
      const center = transform([lon,lat],"EPSG:4326","EPSG:3857")
      map.getView().animate({
        center: center,
        duration: 500
      });
    }
    const  fail = (error) =>{alert('位置情報の取得に失敗しました。エラーコード：' + error.code)}
    let interval
    const stop = () => {clearInterval(interval)}
    const  currentPosition = new Toggle(
      // {	html: '<i class="fa-solid fa-location-crosshairs"></i>',
      {	html: '現',
         className: "current-position",
        active:true,
        onToggle: function(active)
        {
          if(!active) {
            notification.show("現在地を取得します。<br>戻すときはもう一回クリック",5000)
            interval = setInterval(function(){
              navigator.geolocation.getCurrentPosition(success, fail);
            },2000);
          } else {
            stop()
          }
        }
      }
    );
    if (mapName === 'map01') map.addControl(currentPosition);
    // コントロール追加ここまで----------------------------------------------------------------------

    // イベント追加----------------------------------------------------------------
    // フィーチャーにマウスがあたったとき
    map.on("pointermove",function(evt){
      document.querySelector(".ol-viewport").style.cursor = "default";
      const map = evt.map;
      const option = {
        layerFilter: function (layer) {
          return layer.get('name') === 'Mw5center' || layer.get('name') === 'Mw20center';
        }
      };
      const feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {
          return feature;
        },option);
      if (feature) {
        document.querySelector(".ol-viewport").style.cursor = "pointer";
      }
    });
    // シングルクリック------------------------------------------------------------------------------------
    map.on('singleclick', function (evt) {
      console.log(evt)
    })
    map.on('singleclick', function (evt) {
      console.log(transform(evt.coordinate, "EPSG:3857", "EPSG:4326"));
      const map = evt.map;
      const option = {
        layerFilter: function (layer) {
          return layer.get('name') === 'Mw5center' || layer.get('name') === 'Mw20center';
        }
      };
      const feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {
          return feature;
        },option);
      if (feature) {
        const prop = feature.getProperties();
        const uri = prop.uri
        const title = prop.title
        if(uri.includes('stanford')) {
          if (confirm('スタンフォード大学のサイトを表示しますか？')) {
            window.open(uri, '_blank');
          }
        } else {
          notification.show('「' +title + '」の地図はスタンフォード大学にありません。',5000)
        }
        // return
      }
      const layers = map.getLayers().getArray();
      const result5 = layers.find(el => el === Layers.mw5Obj[mapName]);
      const result20 = layers.find(el => el === Layers.mw20Obj[mapName]);
      if(result5 && result20) {
        if(result5.myZindex > result20.myZindex) {
          extentChange(5)
        } else {
          extentChange(20)
        }
      } else if (result5) {
        extentChange(5)
      } else if (result20) {
        extentChange(20)
      }
      function extentChange (mw){
        let gLayers;
        let lonOutside; let latOutside;
        if(mw === 5) {
          gLayers = Layers.mw5Obj[mapName].values_.layers.array_;
          lonOutside = 5000; latOutside = 4000
        } else {
          gLayers = Layers.mw20Obj[mapName].values_.layers.array_;
          lonOutside = 24000; latOutside = 14000
        }
        const lon = evt.coordinate[0], lat = evt.coordinate[1];
        for (let i in gLayers) {
          const extent2 = gLayers[i].values_['extent2'];
          const lonMin = extent2[0], lonMax = extent2[2], latMin = extent2[1], latMax = extent2[3];
          if (lonMin < lon && lonMax > lon) {
            if (latMin < lat && latMax > lat) {
              if (gLayers[i].getExtent()[0] === extent2[0]) {
                maxZndex++;
                gLayers[i].setExtent([lonMin - lonOutside, latMin - latOutside, lonMax + lonOutside, latMax + latOutside]);
                gLayers[i].setZIndex(maxZndex)
              } else {
                gLayers[i].setExtent(extent2);
                gLayers[i].setZIndex(undefined)
              }
              break;
            }
          }
        }
      }
    });
    map.on('moveend', function () {
      vm.zoom[mapName] = 'zoom=' + String(Math.floor(map.getView().getZoom() * 100) / 100)
    });

    //要素の取得
      const elements = document.querySelectorAll(".ol-scale-line, .ol-zoom, .current-position");
    //要素内のクリックされた位置を取得するグローバル（のような）変数
    let x;
    let y;
    //マウスが要素内で押されたとき、又はタッチされたとき発火
    for(let i = 0; i < elements.length; i++) {
      elements[i].addEventListener("mousedown", mdown, false);
      elements[i].addEventListener("touchstart", mdown, false);
    }

    //マウスが押された際の関数
    function mdown(e) {
      //クラス名に .drag を追加
      this.classList.add("drag");
      //タッチデイベントとマウスのイベントの差異を吸収
      if(e.type === "mousedown") {
        const event = e;
      } else {
        const  event = e.changedTouches[0];
      }
      //要素内の相対座標を取得
      x = event.pageX - this.offsetLeft;
      y = event.pageY - this.offsetTop;
      //ムーブイベントにコールバック
      document.body.addEventListener("mousemove", mmove, false);
      document.body.addEventListener("touchmove", mmove, false);
    }

    //マウスカーソルが動いたときに発火
    function mmove(e) {
      //ドラッグしている要素を取得
      const drag = document.getElementsByClassName("drag")[0];
      //同様にマウスとタッチの差異を吸収
      if(e.type === "mousemove") {
        const event = e;
      } else {
        const event = e.changedTouches[0];
      }
      //フリックしたときに画面を動かさないようにデフォルト動作を抑制
      e.preventDefault();
      //マウスが動いた場所に要素を動かす
      drag.style.top = event.pageY - y + "px";
      drag.style.left = event.pageX - x + "px";
      //マウスボタンが離されたとき、またはカーソルが外れたとき発火
      drag.addEventListener("mouseup", mup, false);
      document.body.addEventListener("mouseleave", mup, false);
      drag.addEventListener("touchend", mup, false);
      document.body.addEventListener("touchleave", mup, false);
    }

    //マウスボタンが上がったら発火
    function mup(e) {
      var drag = document.getElementsByClassName("drag")[0];
      //ムーブベントハンドラの消去
      document.body.removeEventListener("mousemove", mmove, false);
      drag.removeEventListener("mouseup", mup, false);
      document.body.removeEventListener("touchmove", mmove, false);
      drag.removeEventListener("touchend", mup, false);
      //クラス名 .drag も消す
      drag.classList.remove("drag");
    }
  }
}

export function synch (vm) {
  vm.synchFlg = !vm.synchFlg;
  let map01View = store.state.base.maps.map01.getView();
  if (!vm.synchFlg) {
    const viewArr = [];
    for (let i = 0; i < 3; i++) {
      viewArr[i] = new View({
        center: map01View.getCenter(),
        zoom: map01View.getZoom()
      })
    }
    store.state.base.maps.map02.setView(viewArr[0]);
    store.state.base.maps.map03.setView(viewArr[1]);
    store.state.base.maps.map04.setView(viewArr[2]);
  } else {
    store.state.base.maps.map02.setView(map01View);
    store.state.base.maps.map03.setView(map01View);
    store.state.base.maps.map04.setView(map01View)
  }
}

export function resize () {
  store.state.base.maps.map01.updateSize();
  store.state.base.maps.map02.updateSize();
  store.state.base.maps.map03.updateSize();
  store.state.base.maps.map04.updateSize()
}

export function watchLayer (map, thisName, newLayerList,oldLayerList) {
  //[0]はレイヤーリスト。[1]はlength
  // 逆ループ
  let myZindex = 0;
  for (let i = newLayerList[0].length - 1; i >= 0; i--) {
    // リストクリックによる追加したレイヤーで リストの先頭で リストの増加があったとき
     const layer = newLayerList[0][i].layer;
    // if (newLayerList[0][i].addFlg) {
    //   if (i === 0 ) {
    //     if (newLayerList[1] > oldLayerList[1]) {
    //       const oldCenter = map.getView().getCenter();
    //       const center = layer.getProperties().center;
    //       if (center) {
    //         map.getView().setCenter(transform(center,"EPSG:4326","EPSG:3857"));
    //         const div = document.querySelector('div').text('元の位置に戻しますか？ ');
    //
    //         $('<a>').text('戻す')
    //         .click(function() {
    //           map.getView().setCenter(oldCenter);
    //           store.state.base.notifications[thisName].hide();
    //         })
    //         .appendTo(div);
    //
    //         $('<a style="margin-left: 10px;">').text('NO')
    //         .click(function() {
    //           store.state.base.notifications[thisName].hide();
    //         })
    //         .appendTo(div);
    //         store.state.base.notifications[thisName].show(div.get(0),5000)
    //       }
    //     }
    //   }
    // }
    // グループレイヤーで個別にzindexを触っているときがあるのでリセット。重くなるようならここをあきらめる。
   if (layer.values_.layers) {
     const gLayers = layer.values_.layers.array_;
     for (let i in gLayers) {
       gLayers[i].setZIndex(undefined);
       const extent2 = gLayers[i].values_['extent2'];
       gLayers[i].setExtent(extent2);
     }
   }
    // グループレイヤーのときzindexは効かないようだ。しかしz順が必要になるときがあるので項目を作っている。
    layer['myZindex'] = myZindex++;
    map.removeLayer(layer);
    map.addLayer(layer);
    layer.setOpacity(newLayerList[0][i].opacity)
    // console.log(newLayerList[0][i])
   // 新規追懐したレイヤーだけにズームとセンターを設定する。
    if (newLayerList[0][0].zoom) {
      map.getView().setZoom(newLayerList[0][0].zoom)
    }
    if (newLayerList[0][0].center) {
      map.getView().setCenter(transform(newLayerList[0][0].center, "EPSG:4326", "EPSG:3857"));
    }
  }
}

export function opacityChange (item) {
  item.layer.setOpacity(item.opacity);
}

export function removeLayer (item, layerList, name) {
  const result = layerList.filter((el) => el.id !== item.id);
  store.commit('base/updateList', {value: result, mapName: name});
  // 削除するレイヤーの透過度を１に戻す。再度追加するときのために
  item.layer.setOpacity(1);
  const map = store.state.base.maps[name];
  map.removeLayer(item.layer)
}

export function lego (name, selected) {
  const map = store.state.base.maps[name];
  try{map.removeFilter(legoFilter);}catch(e){}
  legoFilter = new Lego({ brickSize:selected, img:'brick' });
  map.addFilter(legoFilter);
}

export function legoRemove (name) {
  const map = store.state.base.maps[name];
  try{map.removeFilter(legoFilter);}catch(e){}
}
