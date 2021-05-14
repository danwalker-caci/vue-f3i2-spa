import axios from 'axios'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

let baseUrl = SPCI.webServerRelativeUrl
let eurl = SPCI.webServerRelativeUrl + '/_api/SP.Utilities.Utility.SendEmail'
let userurl = baseUrl + '/_api/SP.UserProfiles.PeopleManager/GetMyProperties'
let useridurl = baseUrl + '/_api/Web/SiteUsers?$filter=Email eq '

export default {
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
  getTasks() {
    var allTasks = []
    function getAllTasks(taskurl) {
      if (taskurl === null) {
        taskurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?"
        taskurl += '$select=*'
      }
      return axios
        .get(taskurl, {
          headers: {
            accept: 'application/json;odata=verbose'
          }
        })
        .then(function(response) {
          // concat the data to a temporary variable
          allTasks = allTasks.concat(response.data.d.results)
          // recursively load tasks if there is a next result
          if (response.data.d.__next) {
            let turl = response.data.d.__next
            return getAllTasks(turl)
          } else {
            console.log('Found ' + allTasks.length + ' tasks')
            return allTasks
          }
        })
        .catch(function(error) {
          console.log('Supportervice Error Getting Milestones: ' + error)
        })
    }
    return getAllTasks(null)
  },
  getUserIdByEmail(email) {
    let url = useridurl + "'" + email + "'"
    return axios
      .get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      .then(function(response) {
        return response
      })
  },
  async SendEmail(payload) {
    const response = await axios.request({
      url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
      method: 'post',
      headers: { Accept: 'application/json; odata=verbose' }
    })
    const digest = response.data.d.GetContextWebInformation.FormDigestValue
    let mail = {
      properties: {
        __metadata: { type: 'SP.Utilities.EmailProperties' },
        From: payload.from,
        To: { results: payload.email },
        Body: payload.body,
        Subject: payload.title
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
        console.log('SupportService Error Sending Email: ' + error)
      })
  }
}
