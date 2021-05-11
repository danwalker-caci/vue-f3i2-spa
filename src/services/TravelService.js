import store from '../store/store'
import axios from 'axios'
import moment from 'moment'
import { isNullOrUndefined } from 'util'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

/* #region BASE */
/* let a = moment()
  .subtract(8, 'days')
  .format('YYYY-MM-DD[T]HH:MM:[00Z]') */
let b = moment()
  .subtract(1, 'days')
  .format('YYYY-MM-DD[T]HH:MM:[00Z]')
let portalemail = ''

let url = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items?$orderby=Id desc"
let gurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items?$orderby=Id desc&$select=*&$filter=(Status eq 'AFRLReview')"
let curl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items?$orderby=Id desc&$select=*,Author/Title,Author/ID,Author/Name,Author/EMail&$expand=Author&$filter=(Company eq '"
let eurl = SPCI.webServerRelativeUrl + '/_api/SP.Utilities.Utility.SendEmail'
let baseurl = SPCI.webAbsoluteUrl
let geturl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items"
geturl += '?$select=*,Author/Title,Author/ID,Author/Name,Author/EMail&$expand=Author&$orderby=Id desc'
let delegateurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Delegates')/items?$select=*,User/Title,User/ID,User/Name,User/EMail,Delegates/Title,Delegates/ID,Delegates/Name,Delegates/EMail&$expand=User,Delegates"
let reporturl = SPCI.webServerRelativeUrl + "/_api/web/lists/getbytitle('TripReports')/RootFolder/Files/Add"
// let trurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items?$select=*&$filter=(EndDate ge datetime'" + a + "') and (EndDate le datetime'" + b + "')"
let trurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items?$orderby=Id desc&$select=*&$filter=(EndDate le datetime'" + b + "') and (Status ne 'Completed')"
let GovTrvlApproversUrl = SPCI.webServerRelativeUrl + "/_api/Web/SiteGroups/GetByName('AFRL Travel Approvers')/users"
/* #endregion */

export default {
  async getFormDigest() {
    const response = await axios.request({
      url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
      method: 'post',
      headers: { Accept: 'application/json; odata=verbose' }
    })
    portalemail = store.state.support.portalemail
    return response
  },
  async getGovTrvlApprovers() {
    let response = await axios.get(GovTrvlApproversUrl, {
      headers: {
        accept: 'application/json;odata=verbose'
      }
    })
    return response
  },
  async getTripsForLateReport() {
    let allTrips = []
    async function getAllTrips(tripurl) {
      if (tripurl === '') {
        tripurl = trurl
      }
      let response = await axios.get(tripurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      let results = response.data.d.results
      allTrips = allTrips.concat(results)
      // recursively load
      if (response.data.d.__next) {
        tripurl = response.data.d.__next
        return getAllTrips(tripurl)
      } else {
        return allTrips
      }
    }
    return getAllTrips('')
  },
  async getTripsByCompany(payload, state) {
    console.log('TRAVEL SERVICE PAYLOAD:' + payload + ', ' + state)
    let company = payload.company
    let allTrips = []
    async function getAllTrips(tripurl, company) {
      if (tripurl === '') {
        tripurl = curl + company + "')"
      }
      let response = await axios.get(tripurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      let results = response.data.d.results
      allTrips = allTrips.concat(results)
      // recursively load
      if (response.data.d.__next) {
        tripurl = response.data.d.__next
        return getAllTrips(tripurl)
      } else {
        return allTrips
      }
    }
    return getAllTrips('', company)
  },
  async getDelegates() {
    let response = await axios.get(delegateurl, {
      headers: {
        accept: 'application/json;odata=verbose'
      }
    })
    let results = response.data.d.results
    return results
  },
  async getAllTrips() {
    let allTrips = []
    async function getAllTrips(purl) {
      if (purl === null) {
        purl = geturl
      }
      let response = await axios.get(purl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      let results = response.data.d.results
      allTrips = allTrips.concat(results)
      // recursively load
      if (response.data.d.__next) {
        purl = response.data.d.__next
        return getAllTrips(purl)
      } else {
        return allTrips
      }
    }
    return getAllTrips(null)
  },
  getAFRLTrips() {
    return axios
      .get(gurl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      .then(function(response) {
        let results = response.data.d.results
        return results
      })
      .catch(function(error) {
        console.log('TravelService Error Getting Results: ' + error)
      })
  },
  async uploadTripReport(payload) {
    let part = "(url='"
    part += payload.file + "',overwrite=true)"
    let url = reporturl + part
    let data = payload.buffer
    let headers = {
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': payload.digest
    }
    try {
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
      console.log('TravelService Error Adding Trip Report: ' + error)
    }
  },
  async getTripById(payload, id) {
    let turl = geturl + '&$filter=(Id eq ' + id + ')'
    return axios
      .get(turl, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      .then(function(response) {
        let results = response.data.d.results
        return results
      })
      .catch(function(error) {
        console.log('TravelService Error Getting Results: ' + error)
      })
  },
  async getReportItem(state, uri) {
    const response = await axios({
      method: 'GET',
      url: uri,
      headers: {
        Accept: 'application/json;odata=verbose'
      }
    })
    return response
  },
  async updateReportItem(payload, digest) {
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
      IndexNumber: payload.IndexNumber
    }
    return axios
      .post(endpoint, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        const notification = {
          type: 'danger',
          title: 'Travel Service Error: ' + error,
          message: 'Error Updating Trip Report Data',
          push: true
        }
        store.dispatch('notification/add', notification, { root: true })
      })
  },
  sendEmail(payload, digest, id) {
    // need to somehow pass the id in the link and then have the system display info for that travel request
    let body = '<p>Hello Security Team,</p><p></p>'
    body += '<p>A new Travel Request has been submitted that requires security forms.</p><p></p>'
    body += '<p>Subject: ' + payload.Subject + '</p>'
    body += '<p>Clearance Required: ' + payload.Clearance + '</p>'
    body += '<p>Please click the link below for more details.</p><p></p>'
    //body += '<p><a href="' + baseurl + '/Pages/' + process.env.ENV_BASE + '#/travel/page/edit?id=' + id + '">Travel</a></p>'
    body += '<p><a href="' + baseurl + '/Pages/Home.aspx#/travel/page/edit?id=' + id + '">Travel</a></p>'
    let mail = {
      properties: {
        __metadata: { type: 'SP.Utilities.EmailProperties' },
        From: portalemail,
        To: { results: ['Michele.Blackburn@caci.com', 'alexie.hazen@caci.com'] },
        Body: body,
        Subject: 'New Travel Request Added To SharePoint'
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
  },
  NewTripEmail(state, digest, payload) {
    // need to somehow pass the id in the link and then have the system display info for that travel request
    let body = '<p>A new Travel Request has been submitted on your workplan.</p><p></p>'
    // add more details
    body += '<p>Subject: ' + payload.title
    body += '<p>WorkPlanNumber: ' + payload.workplan
    body += '<p>Company: ' + payload.company
    let t = payload.travelers
    let s = ''
    for (let i = 0; i < t.length; i++) {
      if (i == 0) {
        s += t[i].firstName + ' ' + t[i].lastName
      } else {
        s += ', ' + t[i].firstName + ' ' + t[i].lastName
      }
    }
    body += '<p>Travelers: ' + s
    // build travelers text
    body += '<p>StartDate: ' + moment(payload.start).format('MM/DD/YYYY')
    body += '<p>EndDate: ' + moment(payload.end).format('MM/DD/YYYY')
    body += '<p>Please click the link below for more details.</p><p></p>'
    //body += '<p><a href="' + baseurl + '/Pages/' + process.env.ENV_BASE + '#/travel/page/edit?id=' + payload.id + '">Approve or Deny Travel Request</a></p>'
    body += '<p><a href="' + baseurl + '/Pages/Home.aspx#/travel/page/edit?id=' + payload.id + '">Approve or Deny Travel Request</a></p>'
    let mail = {
      properties: {
        __metadata: { type: 'SP.Utilities.EmailProperties' },
        From: portalemail,
        To: { results: payload.email }, // removed array designator as the payload will already contain it
        Body: body,
        Subject: 'F3I2Portal - New Travel Request Added To SharePoint'
      }
    }
    store.dispatch('support/addActivity', '<div class="bg-info">TravelService NewTripEmail TO: ' + payload.email + '</div>')
    store.dispatch('support/addActivity', '<div class="bg-info">TravelService NewTripEmail body: ' + body + '</div>')
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
        store.dispatch('support/addActivity', '<div class="bg-danger">TravelService NewTripEmail ERROR: ' + error + '</div>')
        console.log('TravelService Error Sending NewTripEmail: ' + error)
      })
  },
  EditTripEmail(state, digest, payload) {
    // send email to workplan manager regarding state of trip. Reminder of specific actions
    let linktext = 'Edit Travel Request'
    if (payload.linktext) {
      linktext = payload.linktext
    }
    let body = ''
    if (payload.comments && payload.comments !== '') {
      body += '<p>' + payload.comments + '</p><p></p>'
    }
    // add more details
    body += '<p>Subject: ' + payload.title
    body += '<p>WorkPlanNumber: ' + payload.workplan
    if (payload.indexnumber !== null || payload.indexnumber !== '') {
      body += '<p>IndexNumber: ' + payload.indexnumber
    }
    body += '<p>Company: ' + payload.company
    let t = payload.travelers
    let s = ''
    for (let i = 0; i < t.length; i++) {
      if (i == 0) {
        s += t[i].firstName + ' ' + t[i].lastName
      } else {
        s += ', ' + t[i].firstName + ' ' + t[i].lastName
      }
    }
    body += '<p>Travelers: ' + s
    // build travelers text
    body += '<p>StartDate: ' + moment(payload.start).format('MM/DD/YYYY')
    body += '<p>EndDate: ' + moment(payload.end).format('MM/DD/YYYY')
    body += '<p>Please click the link below for more details.</p><p></p>'
    //body += '<p><a href="' + baseurl + '/Pages/' + process.env.ENV_BASE + '#/travel/page/edit?id=' + payload.id + '">' + linktext + '</a></p>'
    body += '<p><a href="' + baseurl + '/Pages/Home.aspx#/travel/page/edit?id=' + payload.id + '">' + linktext + '</a></p>'
    let mail = {
      properties: {
        __metadata: { type: 'SP.Utilities.EmailProperties' },
        From: portalemail,
        To: { results: payload.email },
        Body: body,
        Subject: payload.title
      }
    }
    store.dispatch('support/addActivity', '<div class="bg-info">TravelService EditTripEmail TO: ' + payload.email + '</div>')
    store.dispatch('support/addActivity', '<div class="bg-info">TravelService EditTripEmail body: ' + body + '</div>')
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
        store.dispatch('support/addActivity', '<div class="bg-danger">TravelService NewTripEmail ERROR: ' + error + '</div>')
        console.log('TravelService Error Sending NewTripEmail: ' + error)
      })
  },
  TripReportEmail(state, digest, payload) {
    // send email to workplan manager regarding state of trip. Reminder of specific actions
    let body = ''
    body += '<p>IndexNumber: ' + payload.indexnumber
    body += '<p>Company: ' + payload.company
    body += '<p>StartDate: ' + moment(payload.start).format('MM/DD/YYYY')
    body += '<p>EndDate: ' + moment(payload.end).format('MM/DD/YYYY')
    body += '<p>Please click the link below for more details.</p><p></p>'
    //body += '<p><a href="' + baseurl + '/Pages/' + process.env.ENV_BASE + '#/travel/page/edit?id=' + payload.id + '">' + linktext + '</a></p>'
    body += '<p><a href="' + payload.link + '">' + payload.linktext + '</a></p>'
    let mail = {
      properties: {
        __metadata: { type: 'SP.Utilities.EmailProperties' },
        From: portalemail,
        To: { results: payload.email },
        Body: body,
        Subject: payload.title
      }
    }
    // store.dispatch('support/addActivity', '<div class="bg-info">TravelService EditTripEmail TO: ' + payload.email + '</div>')
    // store.dispatch('support/addActivity', '<div class="bg-info">TravelService EditTripEmail body: ' + body + '</div>')
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
        // TODO: Better error handling and response
        store.dispatch('support/addActivity', '<div class="bg-danger">TravelService NewTripEmail ERROR: ' + error + '</div>')
        console.log('TravelService Error Sending TripReportEmail: ' + error)
      })
  },
  async addTrip(payload, digest) {
    // payload is the full event object as json array with 1 element
    let wp = String(payload[0].WorkPlan).split(', ')
    let t = payload[0].Travelers
    let s = ''
    for (let i = 0; i < t.length; i++) {
      if (i == 0) {
        s += t[i].firstName + ' ' + t[i].lastName
      } else {
        s += ', ' + t[i].firstName + ' ' + t[i].lastName
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
    let itemprops = {
      __metadata: { type: 'SP.Data.TravelListItem' },
      Status: payload[0].Status,
      Title: payload[0].Subject,
      StartDate: moment(payload[0].StartTime).add(8, 'hours'), // .format('YYYY-MM-DD[T]HH:MM:[00Z]'), // adding 8 hours to remove the timezone offset
      EndDate: moment(payload[0].EndTime).add(8, 'hours'), // .format('YYYY-MM-DD[T]HH:MM:[00Z]'), // adding 8 hours to remove the timezone offset
      WorkPlan: payload[0].WorkPlan,
      WorkPlanNumber: wp[0],
      WorkPlanText: wp[1],
      EstimatedCost: Number(payload[0].EstimatedCost),
      OCONUS: payload[0].OCONUS,
      OCONUSLocation: payload[0].OCONUSLocation,
      Company: payload[0].Company,
      TravelFrom: payload[0].TravelFrom,
      TravelTo: payload[0].TravelTo,
      Travelers: JSON.stringify(payload[0].Travelers),
      TravelersText: s,
      Sponsor: payload[0].Sponsor,
      POCName: payload[0].POCName,
      POCEmail: payload[0].POCEmail,
      POCPhone: payload[0].POCPhone,
      Comments: payload[0].Comments,
      Clearance: payload[0].Clearance,
      InternalData: JSON.stringify(payload[0].InternalData),
      VisitRequest: payload[0].VisitRequest === 'Yes' ? 'Yes' : 'No'
    }
    try {
      const response = await axios.post(url, itemprops, config)
      return response
    } catch (error) {
      console.log('TravelService Error Adding Travel: ' + error)
    }
  },
  async editTrip(payload, digest) {
    // payload is the full event object as json array with 1 element
    console.log('EDIT TRIP: ' + payload)
    let t = payload[0].Travelers
    let s = ''
    for (let i = 0; i < t.length; i++) {
      if (i == 0) {
        s += t[i].firstName + ' ' + t[i].lastName
      } else {
        s += ', ' + t[i].firstName + ' ' + t[i].lastName
      }
    }
    let url = payload[0].uri
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': payload[0].etag
    }
    let config = {
      headers: headers
    }

    let itemprops = {
      __metadata: { type: 'SP.Data.TravelListItem' },
      Title: payload[0].Subject,
      Status: payload[0].Status,
      StartDate: moment(payload[0].StartTime).add(8, 'hours'), // .format('YYYY-MM-DD[T]HH:MM:[00Z]'), // adding 8 hours to remove the timezone offset
      EndDate: moment(payload[0].EndTime).add(8, 'hours'), // .format('YYYY-MM-DD[T]HH:MM:[00Z]'), // adding 8 hours to remove the timezone offset
      WorkPlan: payload[0].WorkPlan,
      WorkPlanNumber: payload[0].WorkPlanNumber,
      WorkPlanText: payload[0].WorkPlanText,
      IndexNumber: payload[0].IndexNumber,
      OCONUS: payload[0].OCONUS,
      OCONUSLocation: payload[0].OCONUSLocation,
      OCONUSApprovedBy: payload[0].OCONUSApprovedBy,
      OCONUSApprovedOn: payload[0].OCONUSApprovedOn,
      OCONUSApprovedEmail: payload[0].OCONUSApprovedEmail,
      Company: payload[0].Company,
      TravelFrom: payload[0].TravelFrom,
      TravelTo: payload[0].TravelTo,
      Travelers: JSON.stringify(payload[0].Travelers),
      TravelersText: s,
      Sponsor: payload[0].Sponsor,
      POCName: payload[0].POCName,
      POCEmail: payload[0].POCEmail,
      POCPhone: payload[0].POCPhone,
      Comments: payload[0].Comments,
      Clearance: payload[0].Clearance,
      InternalData: JSON.stringify(payload[0].InternalData),
      PreApproved: payload[0].PreApproved,
      VisitRequest: payload[0].VisitRequest === 'Yes' ? 'Yes' : 'No',
      EstimatedCost: Number(payload[0].EstimatedCost),
      SecurityAction: payload[0].SecurityAction,
      SecurityActionCompleted: payload[0].SecurityActionCompleted
    }

    try {
      const response = await axios.post(url, itemprops, config)
      return response
    } catch (error) {
      console.log('TravelService Error Ediing Travel: ' + error)
    }
  },
  async editTraveler(payload, digest) {
    // payload is the full event object as json array with 1 element
    console.log('EDIT TRAVELER: ' + payload)
    let t = JSON.parse(payload[0].Travelers)
    let s = ''
    for (let i = 0; i < t.length; i++) {
      if (i == 0) {
        s += t[i].firstName + ' ' + t[i].lastName
      } else {
        s += ', ' + t[i].firstName + ' ' + t[i].lastName
      }
    }
    let url = payload[0].uri
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': payload[0].etag
    }
    let config = {
      headers: headers
    }

    let itemprops = {
      __metadata: { type: 'SP.Data.TravelListItem' },
      TravelersText: s
    }

    try {
      const response = await axios.post(url, itemprops, config)
      return response
    } catch (error) {
      console.log('TravelService Error Ediing Travel: ' + error)
    }
  },
  async editTravelData(payload, digest) {
    // payload is the full event object as json array with 1 element
    console.log('EDIT TRAVEL DATA: ' + payload)
    let o = payload[0].OCONUS
    let i = payload[0].InternalData
    if (i && i.length > 2) {
      // internal data exists but needs to be updated to reflect new fields
    } else {
      // add standard interal data options accounting for OCONUS if already selected
      i = {
        Status: payload[0].Status,
        PreApproved: 'No',
        OCONUSTravel: o !== '' ? o : 'No',
        ApprovalRequested: 'No',
        Approval: '',
        ApprovedBy: '',
        ApprovedOn: '',
        DeniedBy: '',
        DeniedOn: '',
        DenialComments: '',
        ATPRequested: 'No',
        ATP: '',
        ATPGrantedBy: '',
        ATPGrantedOn: '',
        ATPDeniedBy: '',
        ATPDeniedOn: '',
        ATPDenialComments: '',
        ManagerEmail: '',
        date: moment().format('MM/DD/YYYY')
      }
    }
    let url = payload[0].uri
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': payload[0].etag
    }
    let config = {
      headers: headers
    }

    let itemprops = {
      __metadata: { type: 'SP.Data.TravelListItem' },
      InternalData: JSON.stringify(i)
    }

    try {
      const response = await axios.post(url, itemprops, config)
      return response
    } catch (error) {
      console.log('TravelService Error Ediing Travel: ' + error)
    }
  },
  async editTripReport(payload, digest) {
    // payload is the full event object as json array with 1 element
    let url = payload[0].uri
    // let wp = String(payload[0].WorkPlan).split(', ')
    let report = {}
    report.Url = payload[0].TripReport
    report.Description = payload[0].name
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': payload[0].etag
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: 'SP.Data.TravelListItem' },
      Status: payload[0].Status,
      TripReport: !isNullOrUndefined(payload[0].TripReport) ? report : ''
    }
    try {
      const response = await axios.post(url, itemprops, config)
      return response
    } catch (error) {
      console.log('TravelService Error Ediing Travel: ' + error)
    }
  },
  async updateTravelStatus(payload, digest) {
    let uri = payload.uri !== null || payload.uri !== undefined ? payload.uri : null
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
      __metadata: { type: 'SP.Data.TravelListItem' },
      Status: payload.status
    }
    try {
      const response = await axios.post(uri, itemprops, config)
      return response
    } catch (error) {
      console.log('TravelService Error Updating Travel Status: ' + error)
    }
  },
  async updateTravelStatusByID(payload, digest) {
    let uri = payload.uri
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': '*'
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: 'SP.Data.TravelListItem' },
      Status: payload.status
    }
    try {
      const response = await axios.post(uri, itemprops, config)
      return response
    } catch (error) {
      console.log('TravelService Error Updating Travel Status: ' + error)
    }
  },
  approveTravel(id, uri, etag, digest) {
    // console.log('TodoService Completing Todo with ID: ' + id + ', Digest: ' + digest + ', Uri: ' + uri + ', etag: ' + etag)
    let taskurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items"
    if (!isNullOrUndefined(uri)) {
      taskurl = uri
    }
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': etag
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: 'SP.Data.TravelListItem' },
      Status: 'Approved'
    }
    return axios
      .post(taskurl, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        console.log('TravelService Error Approving Travel: ' + error)
      })
  },
  cancelTravel(id, uri, etag, digest) {
    // console.log('TodoService Completing Todo with ID: ' + id + ', Digest: ' + digest + ', Uri: ' + uri + ', etag: ' + etag)
    let taskurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items"
    if (!isNullOrUndefined(uri)) {
      taskurl = uri
    }
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': etag
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: 'SP.Data.TravelListItem' },
      Status: 'Cancelled'
    }
    return axios
      .post(taskurl, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        console.log('TravelService Error Cancelling Travel: ' + error)
      })
  },
  postponeTravel(id, uri, etag, digest) {
    // console.log('TodoService Completing Todo with ID: ' + id + ', Digest: ' + digest + ', Uri: ' + uri + ', etag: ' + etag)
    let taskurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Travel')/items"
    if (!isNullOrUndefined(uri)) {
      taskurl = uri
    }
    let headers = {
      'Content-Type': 'application/json;odata=verbose',
      Accept: 'application/json;odata=verbose',
      'X-RequestDigest': digest,
      'X-HTTP-Method': 'MERGE',
      'If-Match': etag
    }
    let config = {
      headers: headers
    }
    let itemprops = {
      __metadata: { type: 'SP.Data.TravelListItem' },
      Status: 'Postponed'
    }
    return axios
      .post(taskurl, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        console.log('TravelService Error Postponing Travel: ' + error)
      })
  }
}
