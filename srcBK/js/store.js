import 'babel-polyfill'
import Vue from 'vue'
import Vuex from 'vuex'
import * as Layers from '../js/layers'
Vue.use(Vuex);

const moduleBase = {
  namespaced: true,
  state: {
    maps: {map01: null, map02: null, map03: null, map04: null},
    layerLists: {
      map01: [{id: 1, title: '標準地図', layer: Layers.Layers[1].children[0].data.layer['map01'], opacity: 1, summary:Layers.Layers[1].children[0].data.summary}],
      map02: [{id: 2, title: '淡色地図', layer: Layers.Layers[1].children[1].data.layer['map02'], opacity: 1, summary:Layers.Layers[1].children[1].data.summary}],
      map03: [{id: 4, title: '色別標高図', layer: Layers.Layers[1].children[3].data.layer['map03'], opacity: 1, summary:Layers.Layers[1].children[3].data.summary}],
      map04: [{id: 5, title: '全国最新写真', layer: Layers.Layers[1].children[4].data.layer['map04'], opacity: 1, summary:Layers.Layers[1].children[4].data.summary}]
    },
    dialogs: {
      menuDialog: {style: {top: '56px', left: '10px', 'z-index': 1, height: 'auto', 'min-width': '300px', display: 'none'}},
      map01: {style: {top: '56px', left:'30px', 'z-index': 1, height: 'auto', 'min-width': '250px', display: 'none'}},
      map02: {style: {top: '56px', left:'30px', 'z-index': 1, height: 'auto', 'min-width': '250px', display: 'none'}},
      map03: {style: {top: '56px', left:'30px', 'z-index': 1, height: 'auto', 'min-width': '250px', display: 'none'}},
      map04: {style: {top: '56px', left:'30px', 'z-index': 1, height: 'auto', 'min-width': '250px', display: 'none'}},
    },
    dialogsInfo: {
      map01: [],
      map02: [],
      map03: [],
      map04: []
    },
    menuFlg:false,
    notifications: {},
    notification: '',
    dialogMaxZindex:1,
    splitFlg: 1
  },
  getters: {
    layerList: (state) => (mapName) => {
      return state.layerLists[mapName]
    },
    layerLists (state) {
      const layerListArr = [];
      layerListArr.push(state.layerLists.map01);layerListArr.push(state.layerLists.map02);layerListArr.push(state.layerLists.map03);layerListArr.push(state.layerLists.map04);
      const layerListArr2 = [];
      for (let layerList of layerListArr) {
        const layerList2 = [];
        for (let layer of layerList) {
          layerList2.push({
            id:layer.id,
            o:layer.opacity,
            c:layer.component
          })
        }
        layerListArr2.push(layerList2)
      }
      // console.log(layerListArr2);
      return JSON.stringify(layerListArr2)
      // return layerListArr2
    }
  },
  mutations: {
    // マップを登録------------------------------------------------------------------------------
    setMap (state,payload) {
      state.maps[payload.mapName] = payload.map
    },
    //-----------------------------------------------------------------------------------------
    setNotifications(state, payload) {
      state.notifications[payload.mapName] = payload.control
    },
    // メニューの展開フラグ-----------------------------------------------------------------------
    menuFlgToggle (state) {
      state.menuFlg = !state.menuFlg
    },
    // ダイアログのマックスz-indedx インクリメント--------------------------------------------------
    incrDialogMaxZindex (state) {
      state.dialogMaxZindex++
    },
    // インフォ用ダイアログの追加------------------------------------------------------------------
    pushDialogsInfo (state,payload) {
      const dialogs = state.dialogsInfo[payload.mapName];
      dialogs.push(payload.dialog)
    },
    // レイヤーリスト更新-------------------------------------------------------------------------
    updateList (state, payload) {
      state.layerLists[payload.mapName] = payload.value
    },
    // レイヤーリスト先頭に追加--------------------------------------------------------------------
    unshiftLayerList (state, payload) {
      const layerList = state.layerLists[payload.mapName];
      const layer = payload.value.layer[payload.mapName];
      if (!layerList.find(el => el.id === payload.value.id)) {
        payload.value.layer = layer;
        layerList.unshift(payload.value)
      }
    },
    // レイヤーリスト一部更新-------------------------------------------------------------------------
    updateListPart (state, payload) {
      const result = state.layerLists[payload.mapName].find(el => el.id === payload.id);
      result.component.values = payload.values;
    },
    // 通知-------------------------------------------------------------------------------------
    updateNotification (state, payload) { state.notification = payload },
    //マップ分割フラグ----------------------------------------------------------------------------
    incrSplitFlg (state) {
      state.splitFlg++;
      if (state.splitFlg === 7) state.splitFlg = 1
    },
    updateSplitFlg (state, payload) {
      state.splitFlg = Number(payload)
    }
  }
};

const moduleInfo = {
  namespaced: true,
  state: {
    selected5m: {
      map01: 100,
      map02: 100,
      map03: 100,
      map04: 100
    },
    selected10m: {
      map01: 100,
      map02: 100,
      map03: 100,
      map04: 100
    },
    seaLevel5m: {
      map01: 10,
      map02: 10,
      map03: 10,
      map04: 10
    },
    seaLevel10m: {
      map01: 10,
      map02: 10,
      map03: 10,
      map04: 10
    }
  },
  getters: {
  },
  mutations: {
    update (state,payload) {
      let variable;
      switch (payload.name) {
        case 'flood5m':
          if (payload.order === 0) {
            variable = 'seaLevel5m'
          } else {
            variable = 'selected5m'
          }
          break;
        case 'flood10m':
          if (payload.order === 0) {
            variable = 'seaLevel10m'
          } else {
            variable = 'selected10m'
          }
          break
      }
      state[variable][payload.mapName] = payload.value
    },
    updateSeaLevel5m (state,payload) {
      state.seaLevel5m[payload.mapName] = payload.value
    },
    updateSeaLevel10m (state,payload) {
      state.seaLevel10m[payload.mapName] = payload.value
    },
    updateSelected5m (state,payload) {
      state.selected5m[payload.mapName] = payload.value
    },
    updateSelected10m (state,payload) {
      state.selected10m[payload.mapName] = payload.value
    }
  }
};

const store = new Vuex.Store({
  modules: {
    base:moduleBase,
    info:moduleInfo
  }
});

export default store
