import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { latLng, tileLayer } from 'leaflet';


import { ChartType, Stat, Chat, Transaction, SeriesItem, IGeoLocation, ICoopType, IDisplayConfig, Email } from './dashboard.model';
import { HttpService } from './http.service';
import { ICdResponse } from '@corpdesk/core';
import { GeoLocationDisplayArr, colrs, emailData } from './data';

// import { statData, revenueChart, salesAnalytics, sparklineEarning, sparklineMonthly, chatData, transactions } from './data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

/**
 * Dashboard Component
 */
export class DashboardComponent implements OnInit {

  term: any;
  chatData: Chat[];
  transactions: Transaction[];
  statData: Stat[];

  //////////////////
  emailIds: number[] = [];
  
  // paginated email data
  emailData: Array<Email>;

  // page number
  page = 1;
  // default page size
  pageSize = 15;
  // total number of records
  totalRecords = 0;

  // start and end index
  startIndex = 1;
  endIndex = 15;

  constructor(
    public formBuilder: UntypedFormBuilder,
    private http: HttpService,
  ) {
    this._fetchData();
  }

  // bread crumb items
  breadCrumbItems: Array<{}>;

  revenueChart: ChartType;
  salesAnalytics: ChartType;
  sparklineEarning: ChartType;
  sparklineMonthly: ChartType;

  // Form submit
  chatSubmit: boolean;

  formData: UntypedFormGroup;


  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 6,
    center: latLng(46.879966, -121.726909)
  };

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Nazox' }, { label: 'Shell-Dashboard', active: true }];
    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]],
    });

    this.emailData = emailData;
    this.totalRecords = emailData.length;

  }

  getPostData() {
    return {
      ctx: "App",
      m: "Coops",
      c: "Coop",
      a: "StatsByGeoLocation",
      dat: {
        "f_vals": [
          {
            "query": {
              "where": { "cdGeoLocationEnabled": true, "cdGeoLocationDisplay": true }
            }
          }
        ],
        "token": "3ffd785f-e885-4d37-addf-0e24379af338"
      },
      "args": {}
    }
  }

  selectedGeoLocations(geoLocationData: IGeoLocation[]): IGeoLocation[] {
    return geoLocationData
      .filter(geoData => geoData.cdGeoLocationDisplay)
  }

  /**
   * add a temporary boolean field for controlling which fields display
   * @param geoLocationData 
   * @returns 
   */
  addGeoLocationDisplayField(geoLocationData: IGeoLocation[]): IGeoLocation[] {
    return geoLocationData.map((geoData) => {
      geoData.cdGeoLocationDisplay = false;
      return geoData;
    })
  }

  setGeoLocationDisplay(geoLocationData: IGeoLocation[], displayConfig: IDisplayConfig): IGeoLocation[] {
    return geoLocationData.map((geoData) => {
      if (geoData.cdGeoLocationId === displayConfig.cdGeoLocationId) {
        // return { ...geoData, displayConfig }; // Update display property for matching object
        geoData.cdGeoLocationDisplay = displayConfig.cdGeoLocationDisplay
      }
      return geoData; // Return unchanged object for non-matching objects
    })
  }

  selectMinYear() {
    return 2016
  }

  activeColors(geoLocationData: IGeoLocation[]) {
    // const countGeoLocations = this.selectedGeoLocations().length
    let cols = []
    for (var i in this.selectedGeoLocations(geoLocationData)) {
      cols.push(colrs[i])
    }
    return cols
  }

  private _fetchData() {
    let postData = this.getPostData()
    let YEAR_MIN = this.selectMinYear()

    this.http.proc(postData).subscribe((resp: any) => {
      let coopData: ICoopType[] = resp.data.coopData
      let locationData: IGeoLocation[] = resp.data.geoLocationData
      locationData = this.addGeoLocationDisplayField(locationData)
      // let displayConfig = {cdGeoLocationId: 111,cdGeoLocationDisplay: true}
      // locationData = this.setGeoLocationDisplay(locationData, displayConfig)
      // displayConfig = {cdGeoLocationId: 115,cdGeoLocationDisplay: true}
      // locationData = this.setGeoLocationDisplay(locationData, displayConfig)
      GeoLocationDisplayArr.forEach(displConfig => {
        locationData = this.setGeoLocationDisplay(locationData, displConfig)
      })


      // Function to filter coopData by cdGeoLocationId and return coopMembersCount
      function membersCountArrFx(locationId: number): number[] {
        return coopData
          .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
          .map(coop => Number(coop.coopMembersCount));
      }

      // Function to filter coopData by cdGeoLocationId and return coopMembersCount
      function yearsArrFx(locationId: number): number[] {
        return coopData
          .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
          .map(coop => Number(coop.coopDescription))
      }

      function geoLocationDataFx(locationId: number) {
        return locationData
          .filter(location => Number(location.cdGeoLocationId) === locationId)
      }

      /**
       * declar container of series data
       */
      let coopByGeoLocSeries: SeriesItem[] = []

      /**
       * populate series data container
       */
      this.selectedGeoLocations(locationData).forEach(gl => {
        let si: SeriesItem = {
          name: geoLocationDataFx(gl.cdGeoLocationId)[0].cdGeoLocationName,
          type: 'column',
          data: membersCountArrFx(gl.cdGeoLocationId)
        }
        coopByGeoLocSeries.push(si)
      })


      // Example usage:
      const geoId = this.selectedGeoLocations(locationData)[0].cdGeoLocationId;
      // const BEN = 119;
      // const membersCountArr_TZ = membersCountArrFx(TZ);
      // console.log("membersCountArr_TZ:", membersCountArr_TZ);
      // const locationTZ = geoLocationDataFx(TZ)
      // const membersCountArr_BEN = membersCountArrFx(BEN);
      // console.log("membersCountArr_BEN:", membersCountArr_BEN);
      // const locationBEN = geoLocationDataFx(BEN)
      const yearsArr = yearsArrFx(geoId);
      console.log("membersCountArr_years:", yearsArr);


      const revenueChart: ChartType = {
        // series: [{
        //   name: locationBEN[0].cdGeoLocationName,
        //   type: 'column',
        //   data: membersCountArr_BEN
        // }, {
        //   name: locationTZ[0].cdGeoLocationName,
        //   type: 'column',
        //   data: membersCountArr_TZ
        // }],
        series: coopByGeoLocSeries,
        chart: {
          height: 280,
          type: 'line',
          toolbar: {
            show: false,
          }
        },
        stroke: {
          width: [0, 3],
          curve: 'smooth'
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '20%',
          },
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: false,
        },
        // colors: [colrs[0], colrs[1]],
        colors: this.activeColors(locationData),
        labels: yearsArr,
      };

      const salesAnalytics: ChartType = {
        series: [20, 20, 20, 20, 20],
        chart: {
          height: 250,
          type: 'donut',
        },
        labels: ['Tanzania', 'Malawi', 'Eswatini', 'The Gambia', 'Ghana'],
        plotOptions: {
          pie: {
            donut: {
              size: '75%'
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: false,
        },
        colors: [colrs[0], colrs[1], colrs[2], colrs[3], colrs[4]],
      };

      const sparklineEarning: ChartType = {
        series: [72],
        chart: {
          type: 'radialBar',
          wight: 60,
          height: 60,
          sparkline: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: false
        },
        colors: ['#5664d2'],
        stroke: {
          lineCap: 'round'
        },
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: '70%'
            },
            track: {
              margin: 0,
            },

            dataLabels: {
              show: false
            }
          }
        }
      };

      const sparklineMonthly: ChartType = {
        series: [65],
        chart: {
          type: 'radialBar',
          wight: 60,
          height: 60,
          sparkline: {
            enabled: true
          }
        },
        dataLabels: {
          enabled: false
        },
        colors: ['#1cbb8c'],
        stroke: {
          lineCap: 'round'
        },
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: '70%'
            },
            track: {
              margin: 0,
            },

            dataLabels: {
              show: false
            }
          }
        }
      };

      const chatData = [
        {
          id: 1,
          name: 'Frank Vickery',
          message: 'Hey! I am available',
          image: 'assets/images/users/avatar-2.jpg',
          time: '12:09'
        },
        {
          id: 2,
          align: 'right',
          name: 'Ricky Clark',
          message: 'Hi, How are you? What about our next meeting?',
          time: '10:02'

        },
        {
          text: 'Today'
        },
        {
          id: 3,
          name: 'Frank Vickery',
          message: 'Hello!',
          image: 'assets/images/users/avatar-2.jpg',
          time: '10:06'
        },
        {
          id: 4,
          name: 'Frank Vickery',
          message: '& Next meeting tomorrow 10.00AM',
          image: 'assets/images/users/avatar-2.jpg',
          time: '10:06'
        },
        {
          id: 5,
          align: 'right',
          name: 'Ricky Clark',
          message: 'Wow that\'s great',
          time: '10:07'
        }
      ];

      const transactions = [
        {
          orderid: '#NZ1563',
          date: '28 Mar, 2020',
          billingname: 'Frank Dean',
          total: '$164',
          paymentstatus: 'Unpaid'
        },
        {
          orderid: '#NZ1564',
          date: '28 Mar, 2020',
          billingname: 'Eddy Torres',
          total: '$141',
          paymentstatus: 'Paid'
        },
        {
          orderid: '#NZ1565',
          date: '29 Mar, 2020',
          billingname: 'Jamison Clark',
          total: '$123',
          paymentstatus: 'Paid'
        },
        {
          orderid: '#NZ1566',
          date: '30 Mar, 2020',
          billingname: 'Jewel Buckley',
          total: '$112',
          paymentstatus: 'Paid'
        },
        {
          orderid: '#NZ1567',
          date: '31 Mar, 2020',
          billingname: 'Jeffrey Waltz',
          total: '$105',
          paymentstatus: 'Unpaid'
        },
        {
          orderid: '#NZ1568',
          date: '01 Apr, 2020',
          billingname: 'Jefferson Allen',
          total: '$160',
          paymentstatus: 'Chargeback'
        }
      ];

      const statData = [
        {
          icon: 'ri-stack-line',
          title: 'Number of SACCOs(Latest,2022)',
          value: '61'
        }, {
          icon: 'ri-store-2-line',
          title: 'Number of Members(Latest,2022)',
          value: '60488'
        }, {
          icon: 'ri-briefcase-4-line',
          title: 'Total Assets(Latest,2022)',
          value: '$ 56414772'
        }
      ];

      this.revenueChart = revenueChart;
      this.salesAnalytics = salesAnalytics;
      this.sparklineEarning = sparklineEarning;
      this.sparklineMonthly = sparklineMonthly;
      this.chatData = chatData;
      this.transactions = transactions;
      this.statData = statData;
    });
  }

  /**
   * Returns form
   */
  get form() {
    return this.formData.controls;
  }

  /**
   * Save the message in chat
   */
  messageSave() {
    const message = this.formData.get('message').value;
    const currentDate = new Date();
    if (this.formData.valid && message) {
      // Message Push in Chat
      this.chatData.push({
        align: 'right',
        name: 'Ricky Clark',
        message,
        time: currentDate.getHours() + ':' + currentDate.getMinutes()
      });

      // Set Form Data Reset
      this.formData = this.formBuilder.group({
        message: null
      });
    }

    this.chatSubmit = true;
  }

  //////////////////////////
  // open(content) {
  //   this.modalService.open(content, { centered: true });
  // }

  /**
   * Handle on page click event
   */
  onPageChange(page: any): void {
    this.startIndex = (page - 1) * this.pageSize + 1;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    this.emailData = emailData.slice(this.startIndex - 1, this.endIndex - 1);
  }

  /**
   * select mail
   * @param event event
   * @param id id of record
   */
  selectMail(event, id) {
    if (event.target.checked) {
      this.emailIds.push(id);
    } else {
      this.emailIds.splice(this.emailIds.indexOf(id), 1);
    }
  }

  deleteMail() {
    const found = this.emailData.some(r => this.emailIds.indexOf(r.id) >= 0);
    if (found) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.emailIds.length; i++) {
        const obj = this.emailData.find(o => o.id === this.emailIds[i]);
        this.emailData.splice(this.emailData.indexOf(obj), 1);
      }
    }
    this.emailIds = [];
  }

  markUnread() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.emailIds.length; i++) {
      const obj = this.emailData.find(o => o.id === this.emailIds[i]);
      const index = this.emailData.indexOf(obj);
      this.emailData[index].unread = true;
    }
    this.emailIds = [];
  }
}
