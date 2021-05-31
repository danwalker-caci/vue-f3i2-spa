<template>
  <b-container fluid class="contentHeight"></b-container>
</template>

<script>
export default {
  name: 'Home',
  props: {
    mode: {
      type: String,
      default: 'default'
    }
  },
  mounted: function() {
    if (this.mode == 'dashboard') {
      this.$router.push({ name: 'Dashboard' })
    }
    if (this.mode == 'dropoff') {
      this.$router.push({ name: 'DropoffLibrary' })
    }
  }
}
</script>

<style></style>
