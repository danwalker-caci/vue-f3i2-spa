import axios from 'axios'

let SPCI = null
if (window._spPageContextInfo) {
  SPCI = window._spPageContextInfo
}

export default {
  getFormDigest() {
    return axios.request({
      url: SPCI.webServerRelativeUrl + '/_api/contextinfo',
      method: 'post',
      headers: { Accept: 'application/json; odata=verbose' }
    })
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
  completeTodo(id, uri, etag, digest) {
    // console.log('TodoService Completing Todo with ID: ' + id + ', Digest: ' + digest + ', Uri: ' + uri + ', etag: ' + etag)
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
  }
}
