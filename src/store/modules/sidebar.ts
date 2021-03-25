/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'
import { SidebarItem } from '@/interfaces/SidebarItem'
import axios from 'axios'
import _ from 'lodash'

declare const _spPageContextInfo: any
const baseUrl = _spPageContextInfo.webAbsoluteUrl
const nurl = baseUrl + "/_api/lists/getbytitle('Navigation')/items?$select=*&$orderby=OrderId"

function formatNavigation(j: any): Array<SidebarItem> {
  const p: Array<SidebarItem> = []
  // console out the sidebar item results
  console.log('SIDEBAR ITEMS FROM AXIOS CALL ' + j)
  return p
}

@Module({ namespaced: true })
class Sidebar extends VuexModule {
  public sidebaritems: Array<SidebarItem> = [
    {
      id: 100,
      isMenu: true,
      name: 'Travel',
      path: '/travel/home',
      children: [
        {
          id: 101,
          name: 'Travel Calendar',
          path: '/travel/home/refreshcalendar',
          library: 'fas',
          icon: 'calendar'
        },
        {
          id: 102,
          name: 'Travel Tracker',
          path: '/travel/home/refreshtracker',
          library: 'fas',
          icon: 'subway',
          filtertype: 'travel'
        },
        {
          id: 103,
          name: 'New Travel Request',
          path: '/travel/home/new',
          library: 'fas',
          icon: 'plane-departure'
        }
      ],
      library: 'fas',
      icon: 'plane'
    },
    {
      id: 200,
      isMenu: true,
      name: 'Personnel',
      children: [
        {
          id: 201,
          name: 'Roster',
          path: '/personnel/roster',
          library: 'fas',
          icon: 'user-check',
          filtertype: 'personnel'
        },
        {
          id: 202,
          name: 'OnBoarding',
          path: '/personnel/onboarding',
          library: 'fas',
          icon: 'user-plus'
        },
        {
          id: 203,
          name: 'OffBoarding',
          path: '/personnel/offboarding',
          library: 'fas',
          icon: 'user-minus'
        }
      ],
      library: 'fas',
      icon: 'users'
    },
    {
      id: 300,
      isMenu: true,
      name: 'Workplans',
      children: [
        {
          id: 301,
          name: 'Active Work Plans',
          path: '/workplans/home/active',
          library: 'fas',
          icon: 'briefcase',
          filtertype: 'workplans'
        }
      ],
      library: 'fas',
      icon: 'ruler-combined'
    },
    {
      id: 400,
      isMenu: true,
      name: 'Financial',
      path: '/financial/home',
      children: [
        {
          id: 401,
          name: 'Dashboard',
          path: '/financial/home',
          library: 'fas',
          icon: 'file-invoice'
        },
        {
          id: 402,
          name: 'Documents',
          path: '/financial/library',
          library: 'fas',
          icon: 'book'
        },
        {
          id: 403,
          name: 'Manning Report',
          path: '/financial/manning',
          library: 'fas',
          icon: 'pusers'
        }
      ],
      library: 'fas',
      icon: 'money-check-alt'
    },
    {
      id: 1000,
      isMenu: false,
      children: [],
      name: 'Portal Administration',
      path: '/admin/home/home',
      library: 'fas',
      icon: 'user-lock'
    }
  ]

  public navigationloaded = false
  public navigation: Array<SidebarItem> = []

  @Mutation
  public addSidebarItem(item: SidebarItem): void {
    // TODO: Update to just push results from axios call as one larger function
    this.sidebaritems.push({
      ...item
    })
  }

  @Mutation
  public updateNavigation(navigation: Array<SidebarItem>): void {
    this.navigation = navigation
  }

  @Mutation
  public updateNavigationLoaded(loaded: boolean): void {
    this.navigationloaded = loaded
  }

  @Action
  public add(item: SidebarItem): void {
    this.context.commit('addSidebarItem', item)
  }

  @Action
  public async getNavigation(): Promise<boolean> {
    this.context.commit('updateLoaded', false)
    let allNavigation: any[] = []
    let p: Array<SidebarItem> = []
    const that = this
    async function getAllNavigation(url: string): Promise<void> {
      if (url === '') {
        url = nurl
      }
      const response = await axios.get(url, {
        headers: {
          accept: 'application/json;odata=verbose'
        }
      })
      allNavigation = allNavigation.concat(response.data.d.results)
      // recursively load items if there is a next result
      if (response.data.d.__next) {
        url = response.data.d.__next
        return getAllNavigation(url)
      } else {
        // call a function from here?
        p = formatNavigation(allNavigation)
        that.context.commit('updateNavigation', p)
        that.context.commit('updateNavigationLoaded', true)
      }
    }
    getAllNavigation('')
    return true
  }
}
export default Sidebar
