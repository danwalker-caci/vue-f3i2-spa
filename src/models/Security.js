import { Model } from '@vuex-orm/core'

export default class Security extends Model {
  static entity = 'security'

  static state = {
    digest: null,
    loaded: false
  }

  static fields() {
    return {
      id: this.number(null),
      Id: this.number(null),
      Title: this.attr(''),
      Company: this.attr(''),
      PersonnelID: this.number(null),
      library: this.attr(''),
      Type: this.attr(''),
      etag: this.attr(null),
      uri: this.attr(null)
    }
  }
}
