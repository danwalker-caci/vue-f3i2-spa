import { Model } from '@vuex-orm/core'

export default class Manning extends Model {
  static entity = 'manning'

  static state() {
    return {
      digest: null,
      loaded: false,
      percentsupport: [
        { text: 'Select...', value: 'S' },
        { text: '0', value: '0' },
        { text: '2', value: '2' },
        { text: '5', value: '5' },
        { text: '10', value: '10' },
        { text: '20', value: '20' },
        { text: '25', value: '25' },
        { text: '30', value: '30' },
        { text: '40', value: '40' },
        { text: '50', value: '50' },
        { text: '60', value: '60' },
        { text: '70', value: '70' },
        { text: '75', value: '75' },
        { text: '80', value: '80' },
        { text: '90', value: '90' },
        { text: '100', value: '100' }
      ],
      mastereffort: [
        { text: 'Select...', value: 'S' },
        { text: '35IS', value: '35IS' },
        { text: 'AI ML', value: 'AI ML' },
        { text: 'CACI PMO', value: 'CACI PMO' },
        { text: 'Data Analytics', value: 'Data Analytics' },
        { text: 'DCGS', value: 'DCGS' },
        { text: 'DRP', value: 'DRP' },
        { text: 'ECP', value: 'ECP' },
        { text: 'ETP', value: 'ETP' },
        { text: 'Guardian', value: 'Guardian' },
        { text: 'GXP', value: 'GXP' },
        { text: 'IMPACT', value: 'IMPACT' },
        { text: 'JEON', value: 'EON' },
        { text: 'NGA Efforts', value: 'NGA Efforts' },
        { text: 'RIGA', value: 'RIGA' },
        { text: 'UNICORN', value: 'UNICORN' }
      ],
      subeffort: [
        { text: 'Select...', value: 'S' },
        { text: '480th Support', value: '480th Support' },
        { text: 'ACC A5/2D', value: 'ACC A5/2D' },
        { text: 'AI ML Capes', value: 'AI ML Capes' },
        { text: 'CACI PMO', value: 'CACI PMO' },
        { text: 'Café 3.X', value: 'Café 3.X' },
        { text: 'CCM', value: 'CCM' },
        { text: 'CDA', value: 'CDA' },
        { text: 'Constant Web', value: 'Constant Web' },
        { text: 'CREW Collaboration', value: 'CREW Collaboration' },
        { text: 'CYAN', value: 'CYAN' },
        { text: 'Cyber I&W', value: 'Cyber I&W' },
        { text: 'DaaS', value: 'DaaS' },
        { text: 'DCGS-Core Staff', value: 'DCGS-Core Staff' },
        { text: 'DRP Acquisition Group', value: 'DRP Acquisition Group' },
        { text: 'DRP Failover', value: 'DRP Failover' },
        { text: 'Ent. Data Environment', value: 'Ent. Data Environment' },
        { text: 'Enterprise Challenge', value: 'Enterprise Challenge' },
        { text: 'Enterprise Collection', value: 'Enterprise Collection' },
        { text: 'ESDC', value: 'ESDC' },
        { text: 'FMV', value: 'FMV' },
        { text: 'GCCS-I3-Agile Training', value: 'GCCS-I3-Agile Training' },
        { text: 'Guardian', value: 'Guardian' },
        { text: 'IMAD', value: 'IMAD' },
        { text: 'JTT', value: 'JTT' },
        { text: 'MaaS', value: 'MaaS' },
        { text: 'MS Surface Hubs', value: 'MS Surface Hubs' },
        { text: 'NEMESYS', value: 'NEMESYS' },
        { text: 'NETMod Training', value: 'NETMod Training' },
        { text: 'OAMC', value: 'OAMC' },
        { text: 'PL3 Filesystem', value: 'PL3 Filesystem' },
        { text: 'PRISMO', value: 'PRISMO' },
        { text: 'Radiant Mercury', value: 'Radiant Mercury' },
        { text: 'REnDER', value: 'REnDER' },
        { text: 'RIEBB Acquisition Support', value: 'RIEBB Acquisition Support' },
        { text: 'RPS', value: 'RPS' },
        { text: 'SSAA for JTF-SD & NSDC', value: 'SSAA for JTF-SD & NSDC' },
        { text: 'STORM', value: 'STORM' },
        { text: 'SUTER', value: 'SUTER' },
        { text: 'Watchman', value: 'Watchman' },
        { text: 'XPLORER', value: 'XPLORER' }
      ],
      ddfields: { text: 'text', value: 'value', index: 'index' }
    }
  }

  static fields() {
    return {
      id: this.attr(null), // internal id
      Id: this.attr(null), // SharePoint id
      Title: this.attr(''),
      Number: this.attr(''),
      Last: this.attr(''),
      First: this.attr(''),
      Middle: this.attr(''),
      MasterEffort: this.attr(''),
      SubEffort: this.attr(''),
      Location: this.attr(''),
      Email: this.attr(''),
      Company: this.attr(''),
      PercentSupport: this.attr(''),
      EmployeeID: this.attr(''),
      FunctionalManager: this.attr(''),
      StartDate: this.attr(''),
      EndDate: this.attr(''),
      FullBurdenedCost: this.attr(''),
      etag: this.attr(null), // Used for updating
      uri: this.attr(null) // Used for updating
    }
  }
}
