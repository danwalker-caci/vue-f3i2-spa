<template>
  <b-container fluid class="contentHeight p-0">
    <iframe id="LibraryFrame" :src="url" height="100%" width="100%"></iframe>
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
      url: '',
      afrlUrl: '/sites/f3i2/AFRL%20Training/Forms/AllItems.aspx?isDlg=1',
      subUrl: '/sites/f3i2/Subcontractor%20Training/Forms/AllItems.aspx?isDlg=1',
      caciUrl: '/sites/f3i2/CACI%20Training/Forms/AllItems.aspx?isDlg=1'
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
    hideRibbon: function() {
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
    },
    routeLibrary: function(lib) {
      switch (lib) {
        case 'AFRL':
          this.url = this.afrlUrl
          break
        case 'Subcontractor':
          this.url = this.subUrl
          break
        case 'CACI':
          this.url = this.caciUrl
          break
      }
      this.$options.interval = setInterval(this.hideRibbon, 500)
    }
  }
}
</script>
<style lang="scss" scoped></style>
