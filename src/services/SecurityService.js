import store from '../store/store'
import axios from 'axios'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

// Rimming out until we need to send emails from Security
let absurl = SPCI.webAbsoluteUrl
let relurl = SPCI.webServerRelativeUrl
let formurlstart = SPCI.webServerRelativeUrl + "/_api/web/lists/getbytitle('"
let formurlend = "')/RootFolder/Files/Add"

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
  async getForms(state, payload) {
    let url = formurlstart + payload.library + "')/items"
    console.log(url)
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
