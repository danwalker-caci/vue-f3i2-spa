<template>
  <div>
    <b-button class="actionbutton" variant="info" @click="goto(data)" title="Review Details">
      <font-awesome-icon far icon="check-circle" class="icon"></font-awesome-icon>
    </b-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: {}
    }
  },
  methods: {
    goto: function(data) {
      this.$bvModal.hide('Todos')
      this.$router.push({ path: data.TaskLink, params: { TaskID: this.Id } })
    }
  }
}
</script>

<style lang="scss">
.actionbutton {
  margin: 2px;
}
</style>
