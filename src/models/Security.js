import { Model } from '@vuex-orm/core'

export default class Security extends Model {
  static entity = 'security'

  static state = {
    digest: null,
    loaded: false,
    securityforms: [],
    securitygroup: [],
    accountgroup: [],
    afrlgroup: [],
    cacgroup: [],
    scigroup: []
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
      CAC: this.attr(''),
      CACValid: this.attr(''),
      CACIssuedBy: this.attr(''),
      CACExpirationDate: this.attr(''),
      CACRequestDate: this.attr(''),
      CACStatus: this.attr(''),
      PersonName: this.attr(''),
      Accounts: this.attr(''),
      SCI: this.attr(''),
      SCIStatus: this.attr(''),
      SCIIndocAssistDate: this.attr(''),
      SCIAccessCheckDate: this.attr(''),
      SCIPR: this.attr(''),
      SCICE: this.attr(''),
      SCIFormType: this.attr(''),
      SCIFormSubmitted: this.attr(''),
      SCIIndoc: this.attr(''),
      SCITransferId: this.attr(''),
      NIPR: this.attr(''),
      SIPR: this.attr(''),
      DREN: this.attr(''),
      JWICS: this.attr(''),
      taskId: this.attr(''),
      NewPersonnelTask: this.attr(''),
      etag: this.attr(null),
      uri: this.attr(null)
    }
  }
}
