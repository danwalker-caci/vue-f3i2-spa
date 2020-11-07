import { Model } from '@vuex-orm/core'

export default class Todo extends Model {
  static entity = 'todos'

  static state() {
    return {
      digest: null,
      loaded: false,
      mytodosloaded: false,
      mytodos: [],
      tempid: null
    }
  }

  static fields() {
    return {
      Id: this.attr(null),
      Title: this.attr(''),
      Status: this.attr(''),
      StartDate: this.attr(null),
      DueDate: this.attr(null),
      AssignedTo: this.attr(null),
      TaskType: this.attr(null),
      etag: this.attr(null), // Used for updating
      uri: this.attr(null) // Used for updating
    }
  }
}
