import Security from '@/models/Security'
import SecurityService from '@/services/SecurityService.js'
import moment from 'moment-timezone'

const getters = {
  allSecurity() {
    return Security.all()
  },
  SecurityForms: state => {
    return state.securityforms
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
    let response = await SecurityService.getFormByTypeId(state, payload)
    return response.data.d
  },
  async getForms({ state }, payload) {
    let response = await SecurityService.getForms(state, payload)
    return formatForms(response)
  },
  async uploadForm({ state }, payload) {
    let report = await SecurityService.uploadForm(payload, state.digest)
    return report
  },
  async updateForm({ state }, payload) {
    let response = await SecurityService.updateForm(payload, state.digest)
    return response
  },
  async addSecurityForm({ state }, payload) {
    let response = await SecurityService.addSecurityForm(payload, state.digest)
    return response
  },
  async updateSecurityForm({ state }, payload) {
    let response = await SecurityService.updateSecurityForm(payload, state.digest)
    return response
  },
  async getSecurityForms({ state }) {
    let response = await SecurityService.getSecurityForms()
    Security.create({ data: formatForms(response) })
    Security.commit(state => {
      state.loaded = true
    })
    state.securityforms = formatForms(response)
  },
  async getSecurityFormById({ state }, payload) {
    let response = await SecurityService.getSecurityFormById(payload, state.digest)
    if (response.length == 0) return response
    return formatForm(response)
  },
  async getSecurityFormsByCompany({ state }, payload) {
    let response = await SecurityService.getSecurityFormsByCompany(payload)
    Security.create({ data: formatForms(response) })
    Security.commit(state => {
      state.loaded = true
    })
    state.securityforms = formatForms(response)
  },
  async getSecurityFormByPersonnelId({ state }, payload) {
    let response = await SecurityService.getSecurityFormByPersonnelId(payload, state.digest)
    if (response.length == 0) {
      return response
    } else {
      return formatForm(response)
    }
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

function formatForms(j) {
  let p = []
  //extrapulate the forms into a nice array of objects
  for (let i = 0; i < j.length; i++) {
    p.push({
      id: j[i]['Id'],
      Id: j[i]['Id'],
      CAC: j[i]['CAC'] ? JSON.parse(j[i]['CAC']) : '', // TODO: sort the CAC forms
      CACValid: j[i]['CACValid'],
      CACIssuedBy: j[i]['CACIssuedBy'],
      CACExpirationDate: moment(j[i]['CACExpirationDate']).isValid() ? moment(j[i]['CACExpirationDate']) : '',
      CACRequestDate: moment(j[i]['CACRequestDate']).isValid() ? moment(j[i]['CACRequestDate']) : '',
      CACExpiredOnDate: moment(j[i]['CACExpiredOnDate']).isValid() ? moment(j[i]['CACExpiredOnDate']) : '',
      CACTurnedIn: j[i]['CACTurnedIn'],
      CACStatus: j[i]['CACStatus'],
      Company: j[i]['Company'],
      PersonnelId: j[i]['PersonnelID'],
      FirstName: j[i]['FirstName'],
      LastName: j[i]['LastName'],
      NIPR: j[i]['NIPR'] ? JSON.parse(j[i]['NIPR']) : '',
      SIPR: j[i]['SIPR'] ? JSON.parse(j[i]['SIPR']) : '',
      DREN: j[i]['DREN'] ? JSON.parse(j[i]['DREN']) : '',
      JWICS: j[i]['JWICS'] ? JSON.parse(j[i]['JWICS']) : '',
      SCI: j[i]['SCI'] ? JSON.parse(j[i]['SCI']) : '', // TODO: sort the SCI forms
      SCIStatus: j[i]['SCIStatus'],
      SCIIndocAssistDate: moment(j[i]['SCIIndocAssistDate']).isValid() ? moment(j[i]['SCIIndocAssistDate']) : '',
      SCIAccessCheckDate: moment(j[i]['SCIAccessCheckDate']).isValid() ? moment(j[i]['SCIAccessCheckDate']) : '',
      SCIFormType: j[i]['SCIFormType'],
      SCIFormSubmitted: moment(j[i]['SCIFormSubmitted']).isValid() ? moment(j[i]['SCIFormSubmitted']) : '',
      SCIIndoc: moment(j[i]['SCIIndoc']).isValid() ? moment(j[i]['SCIIndoc']) : '',
      PRDueDate: moment(j[i]['PRDueDate']).isValid() ? moment(j[i]['PRDueDate']) : '',
      CEDate: moment(j[i]['CEDate']).isValid() ? moment(j[i]['CEDate']) : '',
      Title: j[i]['Title'],
      etag: j[i]['__metadata']['etag'],
      uri: j[i]['__metadata']['uri']
    })
  }
  return p
}

function formatForm(j) {
  let p = {}
  //extrapulate the forms into a nice array of objects
  p = {
    id: j[0]['Id'],
    Id: j[0]['Id'],
    CAC: j[0]['CAC'] ? JSON.parse(j[0]['CAC']) : '',
    CACValid: j[0]['CACValid'],
    CACIssuedBy: j[0]['CACIssuedBy'],
    CACExpirationDate: moment(j[0]['CACExpirationDate']).isValid() ? moment(j[0]['CACExpirationDate']) : '',
    CACRequestDate: moment(j[0]['CACRequestDate']).isValid() ? moment(j[0]['CACRequestDate']) : '',
    CACExpiredOnDate: moment(j[0]['CACExpiredOnDate']).isValid() ? moment(j[0]['CACExpiredOnDate']) : '',
    CACTurnedIn: j[0]['CACTurnedIn'],
    CACStatus: j[0]['CACStatus'],
    Company: j[0]['Company'],
    PersonnelId: j[0]['PersonnelID'],
    PersonName: j[0]['PersonName'],
    FirstName: j[0]['FirstName'],
    LastName: j[0]['LastName'],
    NIPR: j[0]['NIPR'] ? JSON.parse(j[0]['NIPR']) : '',
    SIPR: j[0]['SIPR'] ? JSON.parse(j[0]['SIPR']) : '',
    DREN: j[0]['DREN'] ? JSON.parse(j[0]['DREN']) : '',
    JWICS: j[0]['JWICS'] ? JSON.parse(j[0]['JWICS']) : '',
    SCI: j[0]['SCI'] ? JSON.parse(j[0]['SCI']) : '',
    SCIStatus: j[0]['SCIStatus'],
    SCIIndocAssistDate: moment(j[0]['SCIIndocAssistDate']).isValid() ? moment(j[0]['SCIIndocAssistDate']) : '',
    SCIAccessCheckDate: moment(j[0]['SCIAccessCheckDate']).isValid() ? moment(j[0]['SCIAccessCheckDate']) : '',
    SCIFormType: j[0]['SCIFormType'],
    SCIFormSubmitted: moment(j[0]['SCIFormSubmitted']).isValid() ? moment(j[0]['SCIFormSubmitted']) : '',
    SCIIndoc: moment(j[0]['SCIIndoc']).isValid() ? moment(j[0]['SCIIndoc']) : '',
    PRDueDate: moment(j[0]['PRDueDate']).isValid() ? moment(j[0]['PRDueDate']) : '',
    CEDate: moment(j[0]['CEDate']).isValid() ? moment(j[0]['CEDate']) : '',
    Title: j[0]['Title'],
    etag: j[0]['__metadata']['etag'],
    uri: j[0]['__metadata']['uri']
  }
  return p
}

export default {
  getters,
  actions
}
