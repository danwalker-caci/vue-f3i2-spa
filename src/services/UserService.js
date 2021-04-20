import axios from 'axios'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}
let portalemail = 'F3I-2Portal@caci.com'
let baseUrl = SPCI.webServerRelativeUrl
let userurl = baseUrl + '/_api/SP.UserProfiles.PeopleManager/GetMyProperties'
let idurl = baseUrl + '/_api/Web/CurrentUser?$select=Id'
let eurl = SPCI.webServerRelativeUrl + '/_api/SP.Utilities.Utility.SendEmail'

export default {
  async getFormDigest() {
    const response = await axios.request({
      url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
      method: 'post',
      headers: { Accept: 'application/json; odata=verbose' }
    })
    return response
  },
  getUserId() {
    return axios
      .get(idurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      .then(function(response) {
        return response
      })
  },
  getUserProfile() {
    return axios
      .get(userurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      .then(function(response) {
        return response
      })
  },
  getUserGroups(id) {
    let groupurl = baseUrl + '/_api/web/getuserbyid(' + id + ')/groups'
    return axios
      .get(groupurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      .then(function(response) {
        return response
      })
  },
  async getUserById(payload) {
    let url = baseUrl + '/_api/Web/GetUserById(' + payload.id + ')'
    let response = await axios.get(url, {
      headers: {
        accept: 'application/json;odata=verbose'
      }
    })
    return response
  },
  async getUserProfileFor(payload) {
    let url = baseUrl + "/_api/sp.userprofiles.peoplemanager/GetPropertiesFor(AccountName=@v)?@v='" + encodeURIComponent(payload.login) + "'"
    let response = await axios.get(url, {
      headers: {
        accept: 'application/json;odata=verbose'
      }
    })
    return response
  },
  SendEmail(payload, digest) {
    // need to somehow pass the id in the link and then have the system display info for that travel request
    let mail = {
      properties: {
        __metadata: { type: 'SP.Utilities.EmailProperties' },
        From: portalemail,
        To: { results: payload.To },
        Body: payload.Body,
        Subject: payload.Subject
      }
    }
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'POST'
    }
    let config = {
      headers: headers
    }
    return axios
      .post(eurl, mail, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        console.log('TravelService Error Sending Email: ' + error)
      })
  }
}
