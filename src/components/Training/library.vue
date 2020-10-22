<template>
  <b-container fluid class="contentHeight p-0">
    <iframe id="LibraryFrame" :src="url" height="100%" width="100%"></iframe>
  </b-container>
</template>

<script>
export default {
  name: 'training-library',
  props: {
    AFRL: {
      type: Boolean,
      default: false
    },
    Subcontractor: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      url: '/sites/f3i2/Training/Forms/AllItems.aspx?isDlg=1'
    }
  },
  mounted: function() {
    if (this.AFRL) {
      this.url += '&FilterField1=UserTpe&FilterValue1=AFRL'
    } else if (this.Subcontractor) {
      this.url += '&FilterField1=UserTpe&FilterValue1=Subcontractor'
    }
    this.$options.interval = setInterval(this.hideRibbon, 850)
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
    }
  }
}
</script>
<style lang="scss" scoped></style>
