<template>
    <v-dialog :dialog="S_mainInfoDialog">
        <div :style="contentSize">
          <p>製作者＝kenzkenz</p>
          <p><a href="https://github.com/code4miyazaki/open-hinata" target="_blank" >github</a>の「new」ブランチで開発しています。</p>
          <p><a href="https://twitter.com/kenzkenz" target="_blank">twitter</a></p>
        </div>
    </v-dialog>
</template>

<script>

    export default {
    name: "mainInfo",
    data () {
      return {
        contentSize: {'height': 'auto', 'margin': '10px', 'overflow': 'auto', 'user-select': 'text'},
        btnSize: 'sm',
      }
    },
    computed: {
      S_mainInfoDialog () {
        return this.$store.state.base.dialogs.mainInfoDialog
      }
    },
    methods: {
    },
    mounted () {
      this.$watch(function () {

      });
    }
  }
</script>

<style scoped>
    .olbtn{
        background-color: rgba(0,60,136,0.5);
    }
    .btn-secondary:hover{
        background-color: rgba(0,60,136,0.7);
    }
</style>
