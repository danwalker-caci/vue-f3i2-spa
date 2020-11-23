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
    /* if (console) {
      console.log('TravelModule DIGEST: ' + response)
    } */
    Security.commit(state => {
      state.digest = response.data.d.GetContextWebInformation.FormDigestValue
    })
    return response
  },
  async getForm({ state }, uri) {
    let response = await SecurityService.getForm(state, uri)
    return response
  },
  async getFormByTypeId(payload) {
    if (console) {
      console.log('GETTING FORM BY TYPE ID')
    }
    let response = await SecurityService.getFormByTypeId(payload)
    return response.d.data.reponse
  },
  async uploadForm({ state }, payload) {
    payload.state = state
    let report = await SecurityService.uploadForm(payload)
    return report
  },
  async updateForm({ state }, payload) {
    let response = await SecurityService.updateForm(payload, state.diget)
    return response
  }
}

export default {
  getters,
  actions
}
