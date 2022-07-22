import store from './store'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector';
import ImageLaye from 'ol/layer/Image'
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM.js'
import XYZ from 'ol/source/XYZ.js'
import GeoJSON from 'ol/format/GeoJSON';
import {Fill, Stroke, Style, Text} from 'ol/style';
import RasterSource from 'ol/source/Raster';
import { transformExtent, fromLonLat } from 'ol/proj.js'
import LayerGroup from 'ol/layer/Group';
import mw5 from './mw/mw5'
import mw20 from './mw/mw20'
import Feature from 'ol/Feature'
import Polygon  from "ol/geom/Polygon";
import Crop from 'ol-ext/filter/Crop'
import Mask from 'ol-ext/filter/Mask'
import  * as MaskDep from './mask-dep'
const mapsStr = ['map01','map02','map03','map04'];
const transformE = extent => {
  return transformExtent(extent,'EPSG:4326','EPSG:3857');
};
function flood(pixels, data) {
  var pixel = pixels[0];
  if (pixel[3]) {
    var height = (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) / 100;
    if (height <= data.level) {
      let sinsui = - height + data.level;
      const c = data.colors;
      if (sinsui >= 20) {
        pixel[0] = c.m20.r; pixel[1] = c.m20.g; pixel[2] = c.m20.b; pixel[3] = c.m20.a*255
      } else if (sinsui >= 10) {
        pixel[0] = c.m10.r; pixel[1] = c.m10.g; pixel[2] = c.m10.b; pixel[3] = c.m10.a*255
      } else if (sinsui >= 5) {
        pixel[0] = c.m5.r; pixel[1] = c.m5.g; pixel[2] = c.m5.b; pixel[3] = c.m5.a*255
      } else if (sinsui >= 3) {
        pixel[0] = c.m3.r; pixel[1] = c.m3.g; pixel[2] = c.m3.b; pixel[3] = c.m3.a*255
      } else if (sinsui >= 0.5) {
        pixel[0] = c.m0.r; pixel[1] = c.m0.g; pixel[2] = c.m0.b; pixel[3] = c.m0.a*255
      } else {
        pixel[0] = c.m00.r; pixel[1] = c.m00.g; pixel[2] = c.m00.b; pixel[3] = c.m00.a*255
      }
    } else {
      pixel[3] = 0;
    }
  }
  return pixel;
}
//dem10---------------------------------------------------------------------------------
const elevation10 = new XYZ({
  url:'https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png',
  maxZoom:14,
  crossOrigin:'anonymous'
});
function Dem10 () {
  this.source = new RasterSource({
    sources:[elevation10],
    operation:flood
  })
}
export const flood10Obj = {};
for (let i of mapsStr) {
  flood10Obj[i] = new ImageLaye(new Dem10());
  flood10Obj[i].getSource().on('beforeoperations', function(event) {
    event.data.level = Number(document.querySelector('#' + i  + " .flood-range10m").value);
    event.data.colors = store.state.info.colors;
  });
}
//dem5---------------------------------------------------------------------------------
const elevation5 = new XYZ({
  url:'https://cyberjapandata.gsi.go.jp/xyz/dem5a_png/{z}/{x}/{y}.png',
  minZoom:15,
  maxZoom:15,
  crossOrigin:'anonymous'
});
function Dem5 () {
  this.source = new RasterSource({
    sources:[elevation5],
    operation:flood
  });
  this.maxResolution = 38.22
}
export const flood5Obj = {};
for (let i of mapsStr) {
  flood5Obj[i] = new ImageLaye(new Dem5());
  flood5Obj[i].getSource().on('beforeoperations', function(event) {
    event.data.level = Number(document.querySelector('#' + i  + " .flood-range5m").value);
    event.data.colors = store.state.info.colors;
  });
}

let floodSumm = '';

// オープンストリートマップ------------------------------------------------------------------------
function Osm () {
  this.source = new OSM()
}

const osmObj = {};
for (let i of mapsStr) {
  osmObj[i] = new TileLayer(new Osm())
}
const osmSumm = 'OpenStreetMapは、道路地図などの地理情報データを誰でも利用できるよう、フリーの地理情報データを作成することを目的としたプロジェクトです。<a href=\'https://openstreetmap.jp\' target=\'_blank\'>OpenStreetMap</a>';
// 標準地図------------------------------------------------------------------------------------
function Std () {
  this.source = new XYZ({
    url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 2,
    maxZoom: 18
  })
}
const stdObj = {};
for (let i of mapsStr) {
  stdObj[i] = new TileLayer(new Std())
}
const stdSumm = '国土地理院作成のタイルです。<br><a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">リンク</a>';
// 淡色地図------------------------------------------------------------------------------------
function Pale () {
  this.source = new XYZ({
    url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 2,
    maxZoom: 18
  })
}
const paleObj = {};
for (let i of mapsStr) {
  paleObj[i] = new TileLayer(new Pale())
}
const paleSumm = '国土地理院作成のタイルです。<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">リンク</a>';
// 白地図--------------------------------------------------------------------------------------
function Blank () {
  this.source = new XYZ({
    url: 'https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 2,
    maxZoom: 18
  })
}
const blankObj = {};
for (let i of mapsStr) {
  blankObj[i] = new TileLayer(new Blank())
}
const blankSumm = '国土地理院作成のタイルです。<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">リンク</a>';
// 全国最新写真-------------------------------------------------------------------------------
function Seamlessphoto () {
  this.source = new XYZ({
    url: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    crossOrigin: 'Anonymous',
    minZoom: 2,
    maxZoom: 18
  })
}
const seamlessphotoObj = {};
for (let i of mapsStr) {
  seamlessphotoObj[i] = new TileLayer(new Seamlessphoto())
}
const seamlessphotoSumm = '国土地理院作成のタイルです。<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">リンク</a>';
// 色別標高図---------------------------------------------------------------------------------
function Relief () {
  this.source = new XYZ({
    url: 'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 5,
    maxZoom: 15
  })
}
const reliefObj = {};
for (let i of mapsStr) {
  reliefObj[i] = new TileLayer(new Relief())
}
const reliefSumm = '国土地理院作成のタイルです。<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">リンク</a>';
// 宮崎県航空写真----------------------------------------------------------------------------
function MiyazakiOrt () {
  this.extent = transformE([130.66371,31.34280,131.88045,32.87815]);
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/ort/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 19
  });
}
const miyazakiOrtObj = {};
for (let i of mapsStr) {
  miyazakiOrtObj[i] = new TileLayer(new MiyazakiOrt())
}
const miyazakiOrtSumm = '宮崎県県土整備部砂防課が平成25年度に撮影した航空写真をオルソ補正したもの';
// 静岡県航空写真----------------------------------------------------------------------------
function SizuokaOrt () {
  this.extent = transformE([138.19778,34.8626474,138.671573,35.213088]);
  this.source = new XYZ({
    url: 'https://tile.geospatial.jp/shizuoka_city/h30_aerophoto/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 19
  });
}
const sizuokaOrtObj = {};
for (let i of mapsStr) {
  sizuokaOrtObj[i] = new TileLayer(new SizuokaOrt())
}
const sizuokaOrtSumm = '<a href="https://www.geospatial.jp/ckan/dataset/h30/resource/cb7f8bc4-0ec7-493b-b7fa-f90e5780ac5e" target="_blank">G空間情報センター</a>';
// 室蘭市航空写真----------------------------------------------------------------------------
function MuroransiOrt () {
  this.extent = transformE([140.888332,42.2961046,141.076206,42.44097007]),
    this.source = new XYZ({
      url: 'https://kenzkenz2.xsrv.jp/muroran3/{z}/{x}/{-y}.png',
      crossOrigin: 'Anonymous',
      minZoom: 1,
      maxZoom: 19
    });
}
const muroransiOrtObj = {};
for (let i of mapsStr) {
  muroransiOrtObj[i] = new TileLayer(new MuroransiOrt())
}
const muroransiOrtSumm = '<a href="http://www.city.muroran.lg.jp/main/org2260/odlib.php" target="_blank">むろらんオープンデータライブラリ</a>';
// 鹿児島市航空写真----------------------------------------------------------------------------
function KagosimasiOrt () {
  this.extent = transformE([130.370675,31.2819,130.732,31.767]);
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/orts/kagoshima/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 19
  });
}
const kagosimasiOrtObj = {};
for (let i of mapsStr) {
  kagosimasiOrtObj[i] = new TileLayer(new KagosimasiOrt())
}
const kagosimasiOrtSumm = '<a href="https://www.city.kagoshima.lg.jp/ict/opendata.html" target="_blank">鹿児島市オープンデータ</a>';
// ７４~７８年の航空写真-------------------------------------------------------------------------------
function Sp74 () {
  this.source = new XYZ({
    url: 'https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg',
    crossOrigin: 'Anonymous',
    minZoom: 10,
    maxZoom: 17
  })
}
const sp74Obj = {};
for (let i of mapsStr) {
  sp74Obj[i] = new TileLayer(new Sp74())
}
const sp74Summ = '国土地理院作成のタイルです。<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">リンク</a>';
// ６１~６４年の航空写真-------------------------------------------------------------------------------
function Sp61 () {
  this.source = new XYZ({
    url: 'https://maps.gsi.go.jp/xyz/ort_old10/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 10,
    maxZoom: 17
  })
}
const sp61Obj = {};
for (let i of mapsStr) {
  sp61Obj[i] = new TileLayer(new Sp61())
}
const sp61Summ = '国土地理院作成のタイルです。<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">リンク</a>';
// 川だけ地形地図---------------------------------------------------------------------------
function Kawadake () {
  this.source = new XYZ({
    url: 'http://www.gridscapes.net/AllRivers/1.0.0/t/{z}/{x}/{-y}.png',
    // crossOrigin: 'Anonymous',
    minZoom: 5,
    maxZoom: 14
  });
}
const kawadakeObj = {};
for (let i of mapsStr) {
  kawadakeObj[i] = new TileLayer(new Kawadake())
}
const kawadakeSumm = '<a href="https://www.gridscapes.net/#AllRiversAllLakesTopography" target="_blank">川だけ地形地図</a>';
// 川と流域地図---------------------------------------------------------------------------
function Ryuuiki () {
  this.source = new XYZ({
    url: 'https://tiles.dammaps.jp/ryuiki_t/1/{z}/{x}/{y}.png',
    // crossOrigin: 'Anonymous',
    minZoom: 5,
    maxZoom: 14
  });
}
const ryuuikiObj = {};
for (let i of mapsStr) {
  ryuuikiObj[i] = new TileLayer(new Ryuuiki())
}
const ryuuikiSumm = '<a href="https://tiles.dammaps.jp/ryuiki/" target="_blank">川だけ地形地図</a><br>' +
  '<small>本図は国土交通省 国土数値情報「河川」「流域メッシュ」「湖沼」（第2.1版）および国土地理院 地球地図日本「行政界」（第２版）をもとに高根たかね様が作成したものです。国土数値情報は国土計画関連業務のために作成されたデータが副次的に公開されたものであり、国土計画関連業務に差しさわりがない範囲で時間的、位置的精度において現況と誤差が含まれています。本地図を利用される場合はその点に十分ご留意の上ご利用ください。また、国土数値情報 利用約款を遵守しご利用ください。</small>'
// エコリス植生図---------------------------------------------------------------------------
function Ecoris () {
  this.source = new XYZ({
    url: 'https://map.ecoris.info/tiles/vegehill/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 5,
    maxZoom: 14
  });
}
const ecorisObj = {};
for (let i of mapsStr) {
  ecorisObj[i] = new TileLayer(new Ecoris())
}
const ecorisSumm = '<a href="http://map.ecoris.info/" target="_blank">エコリス地図タイル</a><br>' +
  '<small>第5回 自然環境保全基礎調査 植生調査結果を着色し、国土地理院 基盤地図情報 数値標高データ10mメッシュから作成した陰影起伏図に重ねたものです。</small>'
// 岐阜県CS立体図----------------------------------------------------------------------------
function GihuCs () {
  this.extent = transformE([136.257111,35.141011,137.666902,36.482164143934]);
  this.source = new XYZ({
    url: 'https://kenzkenz2.xsrv.jp/gihucs/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 18
  });
}
const gihuCsObj = {};
for (let i of mapsStr) {
  gihuCsObj[i] = new TileLayer(new GihuCs())
}
const gihuCsSumm = '<a href="https://www.geospatial.jp/ckan/dataset/cs-2019-geotiff" target="_blank">G空間情報センター</a>';
// 兵庫県CS立体図----------------------------------------------------------------------------
function HyougoCs () {
  this.extent = transformE([134.2669714033038, 34.17797854803047,135.47241581374712, 35.783161768341444]);
  this.source = new XYZ({
    url: 'https://kenzkenz.xsrv.jp/tile/hyougo/cs/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 18
  });
}
const hyougoCsObj = {};
for (let i of mapsStr) {
  hyougoCsObj[i] = new TileLayer(new HyougoCs())
}
const hyougoCsSumm = '<a href="https://web.pref.hyogo.lg.jp/kk26/hyogo-geo.html" target="_blank">全国初「全県土分の高精度3次元データ」の公開について</a>';
// 長野県CS立体図----------------------------------------------------------------------------
function NaganoCs () {
  this.extent = transformE([137.34924687267085, 35.181791181300085,138.7683143113627, 37.14523688239089]);
  this.source = new XYZ({
    url: 'https://tile.geospatial.jp/CS/VER2/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 18
  });
}
const naganoCsObj = {};
for (let i of mapsStr) {
  naganoCsObj[i] = new TileLayer(new NaganoCs())
}
const naganoCsSumm = '<a href="https://www.geospatial.jp/ckan/dataset/nagano-csmap" target="_blank">G空間情報センター</a>';
// 静岡県CS立体図----------------------------------------------------------------------------
function SizuokaCs () {
  this.extent = transformE([137.47545,34.59443,139.1504,35.64359]);
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cssizuoka/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 18
  });
}
const sizuokaCsObj = {};
for (let i of mapsStr) {
  sizuokaCsObj[i] = new TileLayer(new SizuokaCs())
}
const sizuokaCsSumm = '<a href="https://www.geospatial.jp/ckan/dataset/shizuokakencsmap2" target="_blank">G空間情報センター</a>';
// 日本CS立体図------------------------------------------------------------------------------
function NihonCs () {
  this.source = new XYZ({
    url: 'http://kouapp.main.jp/csmap/tile/japan/{z}/{x}/{y}.jpg',
    // crossOrigin: 'Anonymous',
    minZoom:9,
    maxZoom:15
  })
}
const nihonCsObj = {};
for (let i of mapsStr) {
  nihonCsObj[i] = new TileLayer(new NihonCs())
}
const nihonCsSumm = '<a href="http://kouapp.main.jp/csmap/japan/setumei.html" target="_blank">日本CS立体図</a>';
// 迅速測図 (関東)----------------------------------------------------------------------------
function Jinsoku () {
  this.extent = transformE([138.954453,34.86946,140.8793163,36.45969967])
  this.source = new XYZ({
    url: 'https://aginfo.cgk.affrc.go.jp/ws/tmc/1.0.0/Kanto_Rapid-900913-L/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:17
  });
}
const jinsokuObj = {};
for (let i of mapsStr) {
  jinsokuObj[i] = new TileLayer(new Jinsoku())
}
const jinsokuSumm = '<a href=\'http://www.finds.jp/tmc/layers.html.ja\' target=\'_blank\'>農研機構</a>';
// 今昔マップ-----------------------------------------------------------------------------------
// 福岡・北九州編------------------------------------------------------------------------------
function Kon_hukuoka01 () {
  this.source = new XYZ({
    url: 'https://sv53.wadax.ne.jp/~ktgis-net/kjmapw/kjtilemap/fukuoka/00/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 16
  });
  this.center = [130.6152588501701, 33.720855341479506];
  this.extent = transformE([130.12549,33.41993,131.1254516,34.003285])
}
const kon_hukuoka01Obj = {};
for (let i of mapsStr) {
  kon_hukuoka01Obj[i] = new TileLayer(new Kon_hukuoka01())
}
const kon_hukuoka01Summ = '';
// CS立体図10Mここから-----------------------------------------------------------------------
function Cs10m01 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/1/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([128.4,32.5,129.530,34.7]);
}
function Cs10m02 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/2/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([129.02,30.2,132.9,34]);
}
function Cs10m03 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/3/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([129.99,33.33,133.7,36.6]);
}
function Cs10m04 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/4/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([131.99,32.68,134.98,34.67]);
}
function Cs10m05 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/5/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([132.99,34.00,135.48,35.8]);
}
function Cs10m06 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/6/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([134.51,33.40,137.02,36.34]);
}
function Cs10m07 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/7/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([135.99,34.00,137.90,37.66]);
}
function Cs10m08 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/8/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([137.00,38.68,139.97,34.56]);
}
function Cs10m09 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/9/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([138.05,38.00,140.99,32.43]);
}
function Cs10m10 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/10/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([139.46,41.65,142.12,37.66]);
}
function Cs10m11 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/11/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([139.00,43.35,141.19,41.33]);
}
function Cs10m12 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/12/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([140.93,45.65,144.05,41.85]);
}
function Cs10m13 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/13/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([143.95,44.35,145.95,42.70]);
}
function Cs10m15 () {
  this.source = new XYZ({
    url: 'https://mtile.pref.miyazaki.lg.jp/tile/cs/15/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom:1,
    maxZoom:15
  });
  this.extent = transformE([126.60,27.37,128.82,26.00]);
}
const cs10mObj = {};
for (let i of mapsStr) {
  cs10mObj[i] = new LayerGroup({
    layers: [
      new TileLayer(new Cs10m01()),
      new TileLayer(new Cs10m02()),
      new TileLayer(new Cs10m03()),
      new TileLayer(new Cs10m04()),
      new TileLayer(new Cs10m05()),
      new TileLayer(new Cs10m06()),
      new TileLayer(new Cs10m07()),
      new TileLayer(new Cs10m08()),
      new TileLayer(new Cs10m09()),
      new TileLayer(new Cs10m10()),
      new TileLayer(new Cs10m11()),
      new TileLayer(new Cs10m12()),
      new TileLayer(new Cs10m13()),
      new TileLayer(new Cs10m15())
    ]
  })
}
const cs10mSumm = '';
// CS立体図10Mここまで-----------------------------------------------------------------------
// 日本版mapwarper５万分の１ここから------------------------------------------------------
// 5万分の1,20万分の1の共用コンストラクタなど
// 共用スタイル
const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000'
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3
    })
  })
});
// タイル
function Mapwarper (url,bbox) {
  this.source = new XYZ({
    url: url,
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 18
  });
  this.extent = transformE(bbox);
  // クリックしたとときにextentを操作するため元のextentを保存しておく。
  this.extent2 = transformE(bbox)
}
// 地図上に地区名を表示する。
function Mw5center () {
  this.name = 'Mw5center';
  this.source = new VectorSource({
    url:'https://kenzkenz.xsrv.jp/open-hinata/geojson/mw5center.geojson',
    format: new GeoJSON()
  });
  this.maxResolution = 1222.99;
  this.style = function(feature) {
    style.getText().setText(feature.get('title') );
    return style;
  }
}
export const mw5Obj = {};
for (let i of mapsStr) {
  const layerGroup = [];
  const length =  mw5.length;
  // const features = [];
  for (let j = 0; j < length; j++) {
    const id = mw5[j].id;
    const url = 'https://mapwarper.h-gis.jp/maps/tile/' + id + '/{z}/{x}/{y}.png';
    const bbox = mw5[j].extent;
    const layer = new TileLayer(new Mapwarper(url,bbox));
    layerGroup.push(layer)
  }
  const mw5centerLayer = new VectorLayer(new Mw5center());
  layerGroup.push(mw5centerLayer);

  mw5Obj[i] = new LayerGroup({
    layers: layerGroup
  })
}
const mw5Summ = '<a href="https://mapwarper.h-gis.jp/" target="_blank">日本版 Map Warper</a><br>' +
  '<a href="https://stanford.maps.arcgis.com/apps/SimpleViewer/index.html?appid=733446cc5a314ddf85c59ecc10321b41" target="_blank">スタンフォード大学</a>';

// 日本版mapwarper５万分の１ここまで------------------------------------------------------
// 日本版mapwarper20万分の１ここから------------------------------------------------------
// 地区名
function Mw20center () {
  this.name = 'Mw20center';
  this.source = new VectorSource({
    url:'https://kenzkenz.xsrv.jp/open-hinata/geojson/mw20center.geojson',
    format: new GeoJSON()
  });
  this.style = function(feature) {
    style.getText().setText(feature.get('title') );
    return style;
  }
}
export const mw20Obj = {};
for (let i of mapsStr) {
  const layerGroup = [];
  const length =  mw20.length;
  for (let j = 0; j < length; j++) {
    const id = mw20[j].id;
    const url = 'https://mapwarper.h-gis.jp/maps/tile/' + id + '/{z}/{x}/{y}.png';
    const bbox = mw20[j].extent;
    const layer = new TileLayer(new Mapwarper(url,bbox));
    layerGroup.push(layer)
  }
  const mw20centerLayer = new VectorLayer(new Mw20center());
  layerGroup.push(mw20centerLayer);

  mw20Obj[i] = new LayerGroup({
    layers: layerGroup
  })
}
const mw20Summ = '<a href="https://mapwarper.h-gis.jp/" target="_blank">日本版 Map Warper</a><br>';
// 日本版mapwarper20万分の１ここまで------------------------------------------------------

// 	東西蝦夷山川地理取調図洪水浸水想定-------------------------------------------------------------------------------
function Ezosansen () {
  this.source = new XYZ({
    url: 'https://koukita.github.io/touzaiezo/tile/{z}/{x}/{y}.jpg',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 17
  })
}
const ezosansenObj = {};
for (let i of mapsStr) {
  ezosansenObj[i] = new TileLayer(new Ezosansen())
}
const ezosansenSumm = '<a href="https://github.com/koukita/touzaiezo" target="_blank">喜多氏のgithub</a>';
// 	東西蝦夷山川地理取調図ここまで------------------------------------------------------------------------

// 	北海道古地図-------------------------------------------------------------------------------
function Kotizu01hokkaidou () {
  this.source = new XYZ({
    url: 'https://kenzkenz.github.io/bunkenzu4/tile/01hokkaidou0/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 17
  })
}
const kotizu01hokkaidouObj = {};
for (let i of mapsStr) {
  kotizu01hokkaidouObj[i] = new TileLayer(new Kotizu01hokkaidou())
}
const kotizu01hokkaidouSumm = '<a href="https://dl.ndl.go.jp/search/searchResult?featureCode=all&searchWord=%E6%9C%80%E6%96%B0%E8%A9%B3%E5%AF%86%E9%87%91%E5%88%BA%E5%88%86%E7%B8%A3%E5%9C%96&fulltext=1&viewRestricted=0" target="_blank">最新詳密金刺分縣圖です。</a></a>';
// 	北海道古地図ここまで------------------------------------------------------------------------
//  レイヤーをマスクする関数
function mask (dep,layer) {
  var coords = dep.geometry.coordinates;
  for (let i=0; i < coords[0].length; i++) {
    coords[0][i] = fromLonLat(coords[0][i])
  }
  var f = new Feature(new Polygon(coords));
  var crop = new Crop({
    feature: f,
    wrapX: true,
    inner: false
  });
  layer.addFilter(crop);
  var mask = new Mask({
    feature: f,
    wrapX: true,
    inner: false,
    fill: new Fill({ color:[255,255,255,0.8] })
  });
  layer.addFilter(mask);
  mask.set('active', false);
}
// 	青森県古地図-------------------------------------------------------------------------------
function Kotizu01aomori () {
  this.extent = transformE([139.767154, 40.37258968,141.8301430,41.6254812]);
  this.source = new XYZ({
    url: 'https://kenzkenz.github.io/bunkenzu/tile/02aomoriken/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 17
  })
}
const kotizu01aomoriObj = {};
for (let i of mapsStr) {
  kotizu01aomoriObj[i] = new TileLayer(new Kotizu01aomori())
  const dep = MaskDep.aomori
  // const dep = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[141.071506651434,40.259568253237404],[141.045757444891,40.24934955870802],[141.02344146588712,40.248039358068496],[141.01829162457852,40.23021811147291],[141.0000955186215,40.219994985839975],[140.98316802410343,40.22382204184183],[140.96875619462696,40.23058241971074],[140.94335031083787,40.24719538713697],[140.95021676591602,40.28256234271339],[140.92618417314262,40.32105199586769],[140.9203476863262,40.33937269407221],[140.92168106149043,40.356622159870994],[140.9459292595955,40.3782639825738],[140.9485041802498,40.394346638730525],[140.94998132072567,40.41978139772348],[140.9170901482674,40.43133523993703],[140.88962432795486,40.4336871840714],[140.86878548942693,40.440818922770546],[140.85931091100298,40.46032719267359],[140.86240081578813,40.4843550416455],[140.87260696312626,40.51096161867224],[140.86549072057332,40.52716596844101],[140.84214477330767,40.52455632840909],[140.81399230748735,40.51202864188724],[140.7942512491378,40.48069918447786],[140.78509918898786,40.45098054108831],[140.72398174177047,40.446216708252024],[140.6570398017809,40.430847114884244],[140.64227692336294,40.41568805836974],[140.6260945043824,40.40393594992628],[140.60571305007178,40.41869400488946],[140.58273749241383,40.427960887475365],[140.54634528049976,40.44076556391431],[140.52162604221851,40.42979027625546],[140.50583319553886,40.44390103133367],[140.49416022190604,40.47341950960336],[140.47630743870292,40.48908776601877],[140.43339209446464,40.47968725101322],[140.40283636936698,40.484387673085706],[140.3650708664373,40.47446417380425],[140.35339789280457,40.45304530927248],[140.3283353317694,40.4342328704048],[140.3094525803046,40.43475550924421],[140.28699806766528,40.428900805301225],[140.26159218387622,40.433343458210686],[140.23481300907153,40.424719216811155],[140.18262795047775,40.43099150205413],[140.16786507205978,40.442750460211926],[140.13372252766487,40.45372363227855],[140.10694335286018,40.452678645462896],[140.0683195430456,40.457119727195504],[140.04377196614132,40.447322832971025],[140.01682112995965,40.44131336453458],[139.98214553181504,40.42824744923689],[139.9397451717076,40.427724759815476],[139.89273891584952,40.48612496205024],[139.85360012190418,40.59153398057603],[139.8476380987071,40.66498800170373],[140.1044435186289,40.85690208195024],[140.21087357234003,41.113994380029936],[140.32451340388297,41.20678775211698],[140.32314011286735,41.276748080629204],[140.85632034968356,41.483093205690466],[140.86318680476168,41.53451291827727],[140.8789796514414,41.56329011728624],[140.93803116511327,41.56483139144882],[141.014332046239,41.51549238450019],[141.17088722202024,41.47974951087647],[141.51558326694212,41.44990582707376],[141.679729435898,40.50669733480862],[141.67498516060493,40.45109306273042],[141.64111275976524,40.42317128844081],[141.61042739457284,40.397866648857956],[141.59017135209237,40.39106830110671],[141.58196562862693,40.36618110793364],[141.56403454133135,40.35259357538919],[141.53804804256757,40.34647187228103],[141.52260001974443,40.3399288809818],[141.50786987164858,40.32870037153177],[141.49478937557538,40.33835988743735],[141.4903261797746,40.35824559836334],[141.47144342830975,40.374202256184674],[141.38870264461835,40.36347770567713],[141.37225095631956,40.35362423102836],[141.3584902422746,40.35615264174126],[141.3450938870899,40.34564912364388],[141.32965113094647,40.34725685130434],[141.32244135311444,40.35510613906706],[141.31595245221519,40.37108733246109],[141.28436675885578,40.367948471192705],[141.24419799664875,40.35329851904601],[141.21707549909016,40.34309399328828],[141.1861764512386,40.333149637012724],[141.15733733991055,40.311685769274675],[141.1157952866879,40.282096331351454],[141.10034576276212,40.28419158501384],[141.08970275739102,40.27423855174655],[141.09794250348477,40.2653319642566],[141.09519592145352,40.26087823067954],[141.071506651434,40.259568253237404]]]}};
  mask(dep,kotizu01aomoriObj[i] )
}
const kotizu01aomoriSumm = '';
// 洪水浸水想定-------------------------------------------------------------------------------
function Shinsuishin () {
  this.source = new XYZ({
    url: 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 17
  })
}
const shinsuishinObj = {};
for (let i of mapsStr) {
  shinsuishinObj[i] = new TileLayer(new Shinsuishin())
}
const shinsuishinSumm = '<img src="https://kenzkenz.xsrv.jp/open-hinata/img/shinsui_legend2-1.png">';
// const shinsuishinSumm = '<img src=@/assets/img/shinsui_legend2-1.png>';
// 洪水浸水想定ここまで------------------------------------------------------------------------

// 津波浸水想定-------------------------------------------------------------------------------
function Tsunami () {
  this.source = new XYZ({
    // url: 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}\.png',
    url: 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_oldlegend/{z}/{x}/{y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 17
  })
}
const tsunamiObj = {};
for (let i of mapsStr) {
  tsunamiObj[i] = new TileLayer(new Tsunami())
}
const tunamiSumm = 'test';
// 津波浸水想定ここまで------------------------------------------------------------------------

// 宮崎市ハザードマップ-------------------------------------------------------------------------------
function MiyazakisiHm () {
  this.source = new XYZ({
    url: 'https://kenzkenz.github.io/hazardmap/tile/miyazakisi/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 18
  })
}
const miyazakisiHmObj = {};
for (let i of mapsStr) {
  miyazakisiHmObj[i] = new TileLayer(new MiyazakisiHm())
}
const miyazakisiHmSumm = '<a href="http://www.city.miyazaki.miyazaki.jp/life/fire_department/hazard_map/1153.html" target="_blank">宮崎市洪水ハザードマップ</a>へ';
// 宮崎市ハザードマップここまで------------------------------------------------------------------------

// 都城市ハザードマップ-------------------------------------------------------------------------------
function MiyakonozyousiHm () {
  this.source = new XYZ({
    url: 'https://kenzkenz.github.io/hazardmap/tile/miyakonozyousi/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 18
  })
}
const miyakonozyousiHmObj = {};
for (let i of mapsStr) {
  miyakonozyousiHmObj[i] = new TileLayer(new MiyakonozyousiHm())
}
const miyakonozyousiHmSumm = '';
// 都城市ハザードマップここまで------------------------------------------------------------------------

// 日向市ハザードマップ-------------------------------------------------------------------------------
function HyuugasiHm () {
  this.source = new XYZ({
    url: 'https://kenzkenz.github.io/hazardmap/tile/hyuugasibousai/{z}/{x}/{-y}.png',
    crossOrigin: 'Anonymous',
    minZoom: 1,
    maxZoom: 18
  })
}
const hyuugasiHmObj = {};
for (let i of mapsStr) {
  hyuugasiHmObj[i] = new TileLayer(new HyuugasiHm())
}
const hyuugasiHmSumm = '';
// 日向市ハザードマップここまで------------------------------------------------------------------------

// ここにレイヤーを全部書く。クリックするとストアのlayerListに追加されていく-------------------------
const layers =
  [
    { text: 'OpenStreetMap', data: { id: 0, layer: osmObj, opacity: 1, summary: osmSumm } },
    { text: '国土地理院',
      children: [
        { text: '標準地図', data: { id: 1, layer: stdObj, opacity: 1, summary: stdSumm } },
        { text: '淡色地図', data: { id: 2, layer: paleObj, opacity: 1, summary: paleSumm } },
        { text: '白地図', data: { id: 3, layer: blankObj, opacity: 1, summary: blankSumm } },
        { text: '色別標高図', data: { id: 4, layer: reliefObj, opacity: 1, summary: reliefSumm } }
      ]},
    { text: '航空写真',
      children: [
        { text: '全国最新写真', data: { id: 'zenkokusaisin', layer: seamlessphotoObj, opacity: 1, summary: seamlessphotoSumm } },
        { text: '宮崎県航空写真', data: { id: 6, layer: miyazakiOrtObj, opacity: 1, zoom:9, center: [131.42386188579064, 31.911063477361182], summary: miyazakiOrtSumm } },
        { text: '静岡県航空写真', data: { id: 7, layer: sizuokaOrtObj, opacity: 1, zoom:12,center:[138.43674074146253, 35.052859245538755], summary: sizuokaOrtSumm } },
        { text: '室蘭市航空写真', data: { id: 'muroransiort', layer: muroransiOrtObj, opacity: 1, zoom:13,center:[140.97759620387416, 42.35223030295967], summary: muroransiOrtSumm } },
        { text: '鹿児島市航空写真', data: { id: 'kagosimasiort', layer: kagosimasiOrtObj, opacity: 1, zoom:12,center:[130.51208842259823, 31.58146097086727], summary: kagosimasiOrtSumm } }
      ]},
    { text: '過去の航空写真',
      children: [
        { text: '74~78年航空写真', data: { id: 'sp74', layer: sp74Obj, opacity: 1, summary: sp74Summ } },
        { text: '61~64年航空写真', data: { id: 'sp61', layer: sp61Obj, opacity: 1, summary: sp61Summ } }
      ]},
    { text: '立体図等',
      children: [
        { text: '川だけ地形地図', data: { id: 'kawadake', layer: kawadakeObj, opacity: 1, summary: kawadakeSumm } },
        { text: '川と流域地図', data: { id: 'ryuuiki', layer: ryuuikiObj, opacity: 1, summary: ryuuikiSumm } },
        { text: 'エコリス植生図', data: { id: 'ecoris', layer: ecorisObj, opacity: 1, summary: ecorisSumm } },
        { text: '日本CS立体図', data: { id: 'jcs', layer: nihonCsObj, opacity: 1, summary: nihonCsSumm } },
        { text: '全国CS立体図10m', data: { id: 'cs10', layer: cs10mObj, opacity: 1, summary: cs10mSumm } },
        { text: '岐阜県CS立体図', data: { id: 'gcs', layer: gihuCsObj, opacity: 1, zoom:9, center:[137.03491577372932, 35.871742161031975], summary: gihuCsSumm } },
        { text: '兵庫県CS立体図', data: { id: 'hyougocs', layer: hyougoCsObj, opacity: 1, zoom:9, center:[134.8428381533734, 35.05148520051671], summary: hyougoCsSumm } },
        { text: '長野県CS立体図', data: { id: 'naganocs', layer: naganoCsObj, opacity: 1, zoom:9, center:[138.14880751631608, 36.19749617538284], summary: naganoCsSumm } },
        { text: '静岡県CS立体図', data: { id: 'sizuokacs', layer: sizuokaCsObj, opacity: 1, zoom:9, center:[138.26385867875933, 35.01475223050842], summary: sizuokaCsSumm } }
      ]},
    { text: '古地図',
      children: [
        { text: '旧版地形図5万分の１', data: { id: 'mw5', layer: mw5Obj, opacity: 1, summary: mw5Summ } },
        { text: '旧版地形図20万分の１', data: { id: 'mw20', layer: mw20Obj, opacity: 1, summary: mw20Summ } },
        { text: '迅速測図 (関東)', data: { id: 'jinsoku', layer: jinsokuObj, opacity: 1, zoom: 9, center: [139.8089637733657, 35.86926927958841], summary: jinsokuSumm } },
        { text: '東西蝦夷山川地理取調図', data: { id: 'ezosansen', layer: ezosansenObj, opacity: 1, zoom: 8, center: [142.6944008210318, 43.241646716680606], summary: ezosansenSumm } },
        { text: '青森県古地図', data: { id: 'kotizu01aomori', layer: kotizu01aomoriObj, opacity: 1, zoom: 9, center: [140.67520521398887, 40.84152054620705], summary: kotizu01aomoriSumm } },
        { text: '最新詳密金刺分縣圖',
          children: [
            { text: '北海道古地図', data: { id: 'kotizu01hokkaidou', layer: kotizu01hokkaidouObj, opacity: 1, zoom: 8, center: [142.6944008210318, 43.241646716680606], summary: kotizu01hokkaidouSumm } },
            { text: '東北',
              children: [
                { text: '青森県古地図', data: { id: 'kotizu01aomori', layer: kotizu01aomoriObj, opacity: 1, zoom: 9, center: [140.67520521398887, 40.84152054620705], summary: kotizu01aomoriSumm } },
                // { text: '1936-1938年', data: { id: 'kon_hu02', layer: nihonCsArr, opacity: 1 } }
              ]}
          ]},
      ]},

    { text: '海面上昇',
      children: [
        { text: '海面上昇シミュ5Mdem', data: { id: 'flood5m', layer: flood5Obj, opacity: 1, summary: floodSumm, component: {name: 'flood5m', values:[]}} },
        { text: '海面上昇シミュ10Mdem', data: { id: 'flood10m', layer: flood10Obj, opacity: 1, summary: floodSumm, component: {name: 'flood10m', values:[]}} },
      ]},
    { text: 'ハザードマップ',
      children: [
        { text: '洪水浸水想定', data: { id: 'shinsuishin', layer: shinsuishinObj, opacity: 1, summary: shinsuishinSumm } },
        { text: '津波浸水想定', data: { id: 'tunami', layer: tsunamiObj, opacity: 1, summary: tunamiSumm } },
        { text: '宮崎市洪水ﾊｻﾞｰﾄﾞﾏｯﾌﾟ', data: { id: 'miyazakisiHm', layer: miyazakisiHmObj, opacity: 1, zoom: 13, center: [131.42054548436312, 31.907339493919977], summary: miyazakisiHmSumm } },
        { text: '都城市洪水ﾊｻﾞｰﾄﾞﾏｯﾌﾟ', data: { id: 'miyakonozyousiHm', layer: miyakonozyousiHmObj, opacity: 1, zoom: 13, center: [131.07797970576192, 31.78882205640913], summary: miyakonozyousiHmSumm } },
        { text: '日向市防災ﾊｻﾞｰﾄﾞﾏｯﾌﾟ', data: { id: 'hyuugasiHm', layer: hyuugasiHmObj, opacity: 1, zoom: 13, center: [131.6400086045909, 32.395198966795306], summary: hyuugasiHmSumm } }
      ]}
  ];
export const Layers = layers;

