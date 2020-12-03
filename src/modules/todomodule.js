/* eslint-disable */
import TodoService from '@/services/TodoService.js'
import User from '@/models/User'
import Todo from '@/models/Todo'
import moment from 'moment'

const getters = {
  allTodos () {
    return Todo.all()
  },
  Loaded: state => {
    return state.loaded
  },
  MyTodosLoaded: state => {
    return state.mytodosloaded
  },
  mytodos: state => {
    return state.mytodos
  }
}

const actions = {
  getDigest() {
    TodoService.getFormDigest()
      .then(response => {
        Todo.commit((state) => {
          state.digest = response.data.d.GetContextWebInformation.FormDigestValue
        }) 
      })
      .catch(error => {
        console.log('There was an error getting digest data: ', error.response)
      })
  },

  /* getTodos({ state, commit }) {
    TodoService.getTodos()
      .then(response => {
        Todo.insert({ data: formatAllTodos(response)})
        Todo.commit((state) => {
          state.loaded = true
        }) 
      })
      .catch(error => {
        console.log('There was an error getting todo data: ', error.response)
      })
  }, */
  async getTodoById({ state }, id) {
    let response = await TodoService.getTodoById(id)
    return response.data.d
  },
  getTodosByUser({ state, commit }, userid) {
    // console.log('getTodosByUser: Getting Todos By User Id: ' + userid)
    state.mytodosloaded = false
    TodoService.getTodosByUser(userid)
      .then(response => {
        // console.log('Todo Data: ' + response)
        Todo.commit((state) => {
          state.mytodosloaded = true
          state.mytodos = formatTodos(response)
        }) 
      })
      .catch(error => {
        console.log('There was an error getting your todo data: ', error.response)
      })
  },
  completeTodo({ state }, payload) {
    Todo.delete(payload.id) 
    return TodoService.completeTodo(payload.id, payload.uri, payload.etag, state.digest)
    .then(response => {
      return response
    })
    .catch(error => {
      console.log('There was an error completing your todo: ', error.response)
    })
  },
  addTodo: async function({ state }, payload) {
    let digest = state.digest ? state.digest : payload.digest
    let response = await TodoService.addTodo(payload, digest)
    return response
  }
}

function formatTodos(j) {
  let todos = []
  for (let i = 0; i < j.length; i++) {
    let body = ''
    if (j[i]['Body'] !== null || j[i]['Body'] !== undefined) { body = String(j[i]['Body']) }
    todos.push({
      Id: String(j[i]['Id']),
      AssignedTo: {
        Title: j[i]["AssignedTo"]["Title"],
        Id: j[i]["AssignedTo"]["ID"],
        Email: j[i]["AssignedTo"]["EMail"]
      },
      Title: j[i]['Title'],
      Body: body.length > 0 ? body : '',
      Status: j[i]['Status'],
      StartDate: moment(j[i]["StartDate"]).isValid() ? moment(j[i]["StartDate"]).format("MM/DD/YYYY") : "",
      DueDate: moment(j[i]["DueDate"]).isValid() ? moment(j[i]["DueDate"]).format("MM/DD/YYYY") : "",
      TaskType: j[i]["TaskType"],
      TaskLink: j[i]["TaskLink"],
      TaskData: String(j[i]["TaskData"]),
      etag: j[i]['__metadata']['etag'],
      uri: j[i]['__metadata']['uri']
    })
  }
  return todos
}

export default{
  getters,
  actions
}