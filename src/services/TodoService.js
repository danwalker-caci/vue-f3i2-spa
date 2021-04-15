import axios from 'axios'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

let url = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items"

export default {
  getFormDigest() {
    return axios.request({
      url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
      method: 'post',
      headers: { Accept: 'application/json; odata=verbose' }
    })
  },
  addTodo: async function(payload, digest) {
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
      __metadata: { type: 'SP.Data.TasksListItem' },
      Title: payload.Title,
      AssignedToId: {
        __metadata: { type: 'Collection(Edm.Int32)' },
        results: Array.isArray(payload.AssignedToId) ? payload.AssignedToId : [payload.AssignedToId]
      },
      Body: payload.Description,
      //StartDate: moment(payload[0].StartTime).add(8, 'hours'), // .format('YYYY-MM-DD[T]HH:MM:[00Z]'), // adding 8 hours to remove the timezone offset
      //EndDate: moment(payload[0].EndTime).add(8, 'hours'), // .format('YYYY-MM-DD[T]HH:MM:[00Z]'), // adding 8 hours to remove the timezone offset
      IsMilestone: payload.IsMilestone,
      PercentComplete: payload.PercentComplete,
      TaskType: payload.TaskType,
      TaskLink: payload.TaskLink,
      TaskInfo: payload.TaskInfo,
      TaskData: payload.TaskData !== null || payload.TaskData !== undefined ? JSON.stringify(payload.TaskData) : ''
    }
    try {
      const response = await axios.post(url, itemprops, config)
      return response
    } catch (error) {
      console.log('Todo Error Adding Task: ' + error)
    }
  },
  getTodos() {
    var allTodos = []
    function getAllTodos(taskurl) {
      if (taskurl === null) {
        taskurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?"
        taskurl += '$select=*,AssignedTo/Id,AssignedTo/FirstName,AssignedTo/LastName,AssignedTo/EMail&$expand=AssignedTo'
      }
      return axios
        .get(taskurl, {
          headers: {
            accept: 'application/json;odata=verbose'
          }
        })
        .then(function(response) {
          // concat the data to a temporary variable
          allTodos = allTodos.concat(response.data.d.results)
          // recursively load tasks if there is a next result
          if (response.data.d.__next) {
            let turl = response.data.d.__next
            return getAllTodos(turl)
          } else {
            console.log('Found ' + allTodos.length + ' todos')
            return allTodos
          }
        })
        .catch(function(error) {
          console.log('TodoService Error Getting Todos: ' + error)
        })
    }
    return getAllTodos(null)
  },
  async getTodoById(id) {
    let todoUrl = url + '(' + id + ')'
    const response = await axios({
      method: 'GET',
      url: todoUrl,
      headers: {
        Accept: 'application/json;odata=verbose'
      }
    })
    return response
  },
  getTodosByUser(id) {
    // console.log('TodoService Getting Todos By User Id: ' + id)
    var allTodos = []
    function getAllTodos(taskurl, id) {
      if (taskurl === null) {
        taskurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items?"
        taskurl += '$select=*,AssignedTo/Id&$expand=AssignedTo/Id'
        taskurl += '&$filter=(AssignedTo/Id eq ' + id + ") and (Status ne 'Completed')"
      }
      return axios
        .get(taskurl, {
          headers: {
            accept: 'application/json;odata=verbose'
          }
        })
        .then(function(response) {
          // concat the data to a temporary variable
          allTodos = allTodos.concat(response.data.d.results)
          // recursively load tasks if there is a next result
          if (response.data.d.__next) {
            let turl = response.data.d.__next
            return getAllTodos(turl)
          } else {
            // console.log("Found " + allTodos.length + " todos")
            return allTodos
          }
        })
        .catch(function(error) {
          console.log('TodoService Error Getting Todos: ' + error)
        })
    }
    return getAllTodos(null, id)
  },
  async completeTodo(id, uri, etag, digest) {
    console.log('TodoService Completing Todo with ID: ' + id + ', Digest: ' + digest + ', Uri: ' + uri + ', etag: ' + etag)
    let taskurl = SPCI.webServerRelativeUrl + "/_api/lists/getbytitle('Tasks')/items"
    if (uri !== null || uri !== undefined) {
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
      __metadata: { type: 'SP.Data.TasksListItem' },
      Status: 'Completed'
    }
    return axios
      .post(taskurl, itemprops, config)
      .then(function(response) {
        return response
      })
      .catch(function(error) {
        console.log('TodoService Error Updating Todo: ' + error)
      })
  },
  async completeTodosByQuery(payload, digest) {
    // get todos based on the query and set their status to complete using payload and digest
    let taskurl = payload.url
    console.log('TASKURL: ' + taskurl)
    const response = await axios({
      method: 'GET',
      url: taskurl,
      headers: {
        Accept: 'application/json;odata=verbose'
      }
    })
    // loop the tasks and complete them
    let results = response.data.d.results
    let c = results.length
    let d = 0
    for (let i = 0; i < results.length; i++) {
      this.completeTodo(results[i]['Id'], results[i]['__metadata']['uri'], results[i]['__metadata']['etag'], digest).then(function() {
        // update counter
        d += 1
      })
    }
    if (c == d) {
      // all tasks should be removed for this
      return true
    } else {
      return false
    }
  }
}
