<template>
  <b-container fluid class="contentHeight p-0">
    <iframe id="LibraryFrame" :src="iframe.src" @load="load" v-show="iframe.loaded" height="100%" width="100%"></iframe>
  </b-container>
</template>

<script>
//let vm = null
export default {
  name: 'training-library',
  props: {
    library: {
      Type: String
    }
  },
  data: function() {
    return {
      iframe: {
        src: '',
        loaded: false
      },
      afrlUrl: process.env.VUE_APP_BASE_URL + '/AFRL%20Training/Forms/AllItems.aspx?isDlg=1',
      subUrl: process.env.VUE_APP_BASE_URL + '/Subcontractor%20Training/Forms/AllItems.aspx?isDlg=1',
      caciUrl: process.env.VUE_APP_BASE_URL + '/CACI%20Training/Forms/AllItems.aspx?isDlg=1'
    }
  },
  mounted: function() {
    //vm = this
    this.routeLibrary(this.library)
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    $route(to, from) {
      this.routeLibrary(to.params.library)
    }
  },
  methods: {
    routeLibrary: function(lib) {
      this.iframe.loaded = false
      switch (lib) {
        case 'AFRL':
          this.iframe.src = this.afrlUrl
          break
        case 'Subcontractor':
          this.iframe.src = this.subUrl
          break
        case 'CACI':
          this.iframe.src = this.caciUrl
          break
      }
      this.$options.interval = setInterval(this.load, 750)
    },
    load: function() {
      clearInterval(this.$options.interval)
      try {
        let frame = document.getElementsByTagName('iframe')[0].contentWindow
        frame.document.getElementById('s4-ribbonrow').style.display = 'none'
        frame.document.getElementById('s4-workspace').style.padding = '15px'
        frame.document.getElementById('CSRListViewControlDivWPQ2').style.display = 'none'
        frame.document.getElementById('Hero-WPQ2').style.display = 'none'
        frame.document.querySelector('.ms-viewheadertr.ms-vhltr').style.display = 'none'
      } catch (e) {
        // don't care here
      }
      this.iframe.loaded = true
    }
  }
}
</script>
<style lang="scss" scoped></style>
