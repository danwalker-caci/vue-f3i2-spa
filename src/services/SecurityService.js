import store from '../store/store'
import axios from 'axios'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

let absurl = SPCI.webAbsoluteUrl
let relurl = SPCI.webServerRelativeUrl
let formurlstart = SPCI.webServerRelativeUrl + "/_api/web/lists/getbytitle('"
let formurlend = "')/RootFolder/Files/Add"
let securityformurl = SPCI.webServerRelativeUrl + "/_api/Web/Lists/getbytitle('Security')/items"
//let securityformurl = SPCI.webServerRelativeUrl + "/_api/Web/Lists/getbytitle('TestSecurityForms')/items"

export default {
  getFormDigest() {
    return axios.request({
      url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
      method: 'post',
      headers: { Accept: 'application/json; odata=verbose' }
    })
  },
  async getForm(state, uri) {
    const response = await axios({
      method: 'GET',
      url: uri,
      headers: {
        Accept: 'application/json;odata=verbose'
      }
    })
    return response
  },
  async getFormByTypeId(state, payload) {
    let url = formurlstart + payload.library + "')/items(" + payload.id + ')'
    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        Accept: 'application/json;odata=verbose'
      }
    })
    return response
  },
  async uploadForm(payload, digest) {
    let part = "(url='"
    part += payload.file + "',overwrite=true)"
    let url = formurlstart + payload.library + formurlend + part
    let data = payload.buffer
    let headers = {
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest
    }
    try {
      // doing the upload
      const response = await axios({
        url: url,
        method: 'POST',
        data: data,
        processData: false,
        async: false,
        headers: headers
      })
      return response
    } catch (error) {
      console.log('SecurityService Error Adding Form: ' + error)
    }
  },
  async updateForm(payload, digest) {
    let endpoint = payload.uri
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': payload.etag
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: payload.type },
      FileLeafRef: payload.name,
      Title: payload.name,
      PersonnelID: payload.PersonnelID,
      PersonName: payload.PersonName,
      Company: payload.Company,
      TaskID: payload.TaskID
    }
    if (payload.SCIType) {
      itemprops.SCIType = payload.SCIType
    }
    return axios
      .post(endpoint, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        const notification = {
          type: 'danger',
          title: 'Security Service Error: ' + error,
          message: 'Error Updating Security Form Data',
          push: true
        }
        store.dispatch('notification/add', notification, { root: true })
      })
  },
  addSecurityForm(payload, digest) {
    let endpoint = securityformurl
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'POST',
      'If-Match': '*'
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: 'SP.Data.SecurityListItem' },
      //__metadata: { type: 'SP.Data.TestSecurityFormsListItem' },
      Title: payload.Title,
      PersonnelID: payload.PersonnelID,
      PersonName: payload.PersonName,
      FirstName: payload.FirstName,
      LastName: payload.LastName,
      Company: payload.Company
    }
    if (payload.NIPR) {
      itemprops.NIPR = payload.NIPR
    }
    if (payload.SIPR) {
      itemprops.SIPR = payload.SIPR
    }
    if (payload.DREN) {
      itemprops.DREN = payload.DREN
    }
    if (payload.JWICS) {
      itemprops.JWICS = payload.JWICS
    }
    if (payload.SCI) {
      itemprops.SCI = payload.SCI
    }
    if (payload.CAC) {
      itemprops.CAC = payload.CAC
    }
    itemprops.CACValid = payload.CACValid
    itemprops.CACExpirationDate = payload.CACExpirationDate
    itemprops.CACExpiredOnDate = payload.CACExpiredOnDate
    itemprops.CACTurnedIn = payload.CACTurnedIn
    itemprops.CACRequestDate = payload.CACRequestDate
    itemprops.CACIssuedBy = payload.CACIssuedBy
    itemprops.CACStatus = payload.CACStatus
    itemprops.SCIAccessCheckDate = payload.SCIAccessCheckDate
    itemprops.SCIStatus = payload.SCIStatus
    itemprops.SCIFormType = payload.SCIFormType
    itemprops.SCIFormSubmitted = payload.SCIFormSubmitted
    itemprops.PRDueDate = payload.PRDueDate
    itemprops.CEDueDate = payload.CEDueDate
    itemprops.SCIIndoc = payload.SCIIndoc
    return axios
      .post(endpoint, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        const notification = {
          type: 'danger',
          title: 'Security Service Error: ' + error,
          message: 'Error Approving Security Form Data',
          push: true
        }
        store.dispatch('notification/add', notification, { root: true })
      })
  },
  updateSecurityForm(payload, digest) {
    let endpoint = payload.uri
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': payload.etag
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: 'SP.Data.SecurityListItem' },
      //__metadata: { type: 'SP.Data.TestSecurityFormsListItem' },
      Title: payload.Title,
      PersonnelID: payload.PersonnelID,
      PersonName: payload.PersonName,
      FirstName: payload.FirstName,
      LastName: payload.LastName,
      Company: payload.Company,
      CACValid: payload.CACValid,
      CACIssuedBy: payload.CACIssuedBy,
      CACExpirationDate: payload.CACExpirationDate,
      CACRequestDate: payload.CACRequestDate,
      CACExpiredOnDate: payload.CACExpiredOnDate,
      CACTurnedIn: payload.CACTurnedIn,
      CACStatus: payload.CACStatus,
      SCIAccessCheckDate: payload.SCIAccessCheckDate,
      SCIStatus: payload.SCIStatus,
      SCIIndocAssistDate: payload.SCIIndocAssistDate,
      PRDueDate: payload.PRDueDate,
      CEDate: payload.CEDate,
      SCIFormType: payload.SCIFormType,
      SCIFormSubmitted: payload.SCIFormSubmitted,
      SCIIndoc: payload.SCIIndoc
    }
    if (payload.NIPR) {
      itemprops.NIPR = payload.NIPR
    }
    if (payload.SIPR) {
      itemprops.SIPR = payload.SIPR
    }
    if (payload.DREN) {
      itemprops.DREN = payload.DREN
    }
    if (payload.JWICS) {
      itemprops.JWICS = payload.JWICS
    }
    if (payload.SCI) {
      itemprops.SCI = payload.SCI
    }
    if (payload.CAC) {
      itemprops.CAC = payload.CAC
    }
    return axios
      .post(endpoint, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        const notification = {
          type: 'danger',
          title: 'Security Service Error: ' + error,
          message: 'Error Updating Security Form Data',
          push: true
        }
        store.dispatch('notification/add', notification, { root: true })
      })
  },
  async getSecurityForms() {
    let allSecurityForms = []
    async function getAllSecurityForms(sfurl) {
      if (sfurl === null) {
        sfurl = securityformurl + '?$orderby=LastName'
      }

      let response = await axios.get(sfurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      let results = response.data.d.results
      allSecurityForms = allSecurityForms.concat(results)
      // recursively load people if there is a next result
      if (response.data.d.__next) {
        sfurl = response.data.d.__next
        return getAllSecurityForms(sfurl)
      } else {
        return allSecurityForms
      }
    }
    return getAllSecurityForms(null)
  },
  async getSecurityFormById(payload) {
    let url = securityformurl + '?$filter=(Id eq ' + payload.Id + ')'
    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        Accept: 'application/json;odata=verbose'
      }
    }).catch(function(error) {
      const notification = {
        type: 'danger',
        title: 'Security Service Error: ' + error,
        message: 'Error Adding Security Form Data',
        push: true
      }
      store.dispatch('notification/add', notification, { root: true })
    })
    return response.data.d.results
  },
  async getSecurityFormsByCompany(payload) {
    let allSecurityForms = []
    async function getAllSecurityForms(sfurl) {
      if (sfurl === null) {
        sfurl = securityformurl + "?$filter=(Company eq '" + payload.company + "')"
      }

      let response = await axios.get(sfurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      let results = response.data.d.results
      allSecurityForms = allSecurityForms.concat(results)
      // recursively load people if there is a next result
      if (response.data.d.__next) {
        sfurl = response.data.d.__next
        return getAllSecurityForms(sfurl)
      } else {
        return allSecurityForms
      }
    }
    return getAllSecurityForms(null)
  },
  async getSecurityFormByPersonnelId(payload) {
    let url = securityformurl + '?$filter=(PersonnelID eq ' + payload.PersonnelID + ')'
    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        Accept: 'application/json;odata=verbose'
      }
    }).catch(function(error) {
      const notification = {
        type: 'danger',
        title: 'Security Service Error: ' + error,
        message: 'Error Adding Security Form Data',
        push: true
      }
      store.dispatch('notification/add', notification, { root: true })
    })
    return response.data.d.results
  },
  // TO DO: include type, form id, personnel id and update JSON object
  ApproveForm(payload, digest) {
    let endpoint = payload.uri
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': payload.etag
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: payload.type },
      Approval: 'Approved'
    }
    return axios
      .post(endpoint, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        const notification = {
          type: 'danger',
          title: 'Security Service Error: ' + error,
          message: 'Error Approving Security Form Data',
          push: true
        }
        store.dispatch('notification/add', notification, { root: true })
      })
  },
  DeleteForm(payload, digest) {
    let endpoint = absurl + "/_api/web/GetFileByServerRelativeUrl('" + relurl + '/' + payload.library + '/' + payload.name + "')"
    //let endpoint = formurlstart + payload.library + "')/items(" + payload.id + ')'
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'DELETE',
      'If-Match': '*'
    }
    let config = {
      headers: headers
    }
    return axios
      .post(endpoint, null, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        const notification = {
          type: 'danger',
          title: 'Security Service Error: ' + error,
          message: 'Error Approving Security Form Data',
          push: true
        }
        store.dispatch('notification/add', notification, { root: true })
      })
  }
}
