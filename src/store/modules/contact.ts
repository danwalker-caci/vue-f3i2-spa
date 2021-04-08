/* eslint-disable @typescript-eslint/no-this-alias */
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'
import { ContactItem } from '@/interfaces/ContactItem'
import axios from 'axios'

declare const _spPageContextInfo: any

const baseUrl = _spPageContextInfo.webServerRelativeUrl
const curl = baseUrl + "/_api/lists/getbytitle('Personnel')/items?$select=*&$orderby=ContactOrder&$filter=(Contact eq 1)"

@Module({ namespaced: true })
class Contact extends VuexModule {
  public loaded?: boolean = false
  public contacts?: Array<ContactItem> = []

  @Mutation
  public updateLoaded(loaded: boolean): void {
    this.loaded = loaded
  }

  @Mutation
  public updateContacts(contacts: Array<any>): void {
    this.contacts = contacts
  }

  @Action
  public async getContacts(): Promise<boolean> {
    // const that = this
    const p: Array<ContactItem> = []
    const response = await axios.get(curl, {
      headers: {
        accept: 'application/json;odata=verbose'
      }
    })
    const j = response.data.d.results
    for (let i = 0; i < j.length; i++) {
      p.push({
        Id: Number(j[i]['Id']),
        Name: j[i]['FirstName'] + ' ' + j[i]['Title'],
        Position: j[i]['Position'],
        Email: j[i]['Email'],
        Phone: j[i]['Phone']
      })
    }
    this.context.commit('updateContacts', p)
    this.context.commit('updateLoaded', true)
    return true
  }
}

export default Contact
