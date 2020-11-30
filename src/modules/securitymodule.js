import Security from '@/models/Security'
import SecurityService from '@/services/SecurityService.js'

const getters = {
  allSecurity() {
    return Security.all()
  }
}

const actions = {
  getDigest() {
    SecurityService.getFormDigest()
      .then(response => {
        Security.commit(state => {
          state.digest = response.data.d.GetContextWebInformation.FormDigestValue
        })
      })
      .catch(error => {
        console.log('There was an error getting digest data: ', error.response)
      })
  },
  async getForm({ state }, uri) {
    let response = await SecurityService.getForm(state, uri)
    return response
  },
  async getFormByTypeId({ state }, payload) {
    payload.state = state
    let response = await SecurityService.getFormByTypeId(payload)
    return response.data.d
  },
  async uploadForm({ state }, payload) {
    payload.state = state
    let report = await SecurityService.uploadForm(payload)
    return report
  },
  async updateForm({ state }, payload) {
    let response = await SecurityService.updateForm(payload, state.digest)
    return response
  },
  ApproveForm({ state }, payload) {
    let response = SecurityService.ApproveForm(payload, state.digest)
    return response
  },
  DeleteForm({ state }, payload) {
    let response = SecurityService.DeleteForm(payload, state.digest)
    return response
  }
}

export default {
  getters,
  actions
}
