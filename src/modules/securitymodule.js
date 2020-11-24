import Security from '@/models/Security'
import SecurityService from '@/services/SecurityService.js'

const getters = {
  allSecurity() {
    return Security.all()
  }
}

const actions = {
  async getDigest() {
    let response = await SecurityService.getFormDigest()
    Security.commit(state => {
      state.digest = response.data.d.GetContextWebInformation.FormDigestValue
    })
    return response
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
  async ApproveForm({ state }, payload) {
    let response = await SecurityService.ApproveForm(payload, state.digest)
    return response
  },
  async DeleteForm({ state }, payload) {
    let response = await SecurityService.DeleteForm(payload, state.digest)
    return response
  }
}

export default {
  getters,
  actions
}
