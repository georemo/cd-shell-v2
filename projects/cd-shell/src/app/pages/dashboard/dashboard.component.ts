import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { latLng, tileLayer } from 'leaflet';


import { ChartType, Stat, Chat, Transaction, SeriesItem, IGeoLocation, ICoopType, IDisplayConfig, Email, ICoopDataSeries } from './dashboard.model';
import { HttpService } from './http.service';
import { ICdResponse } from '@corpdesk/core';
import { GeoLocationDisplayArr, YEAR_MIN, colrs, emailData, coopParamOptions } from './data';
import { Observable } from 'rxjs';
import fetch from 'node-fetch';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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

  coopData: ICoopType[]
  selectedCoopParam = "coopCountSeries"
  locationData: IGeoLocation[]
  coopByGeoLocSeries: SeriesItem[] = []
  httpOptions: any

  /////////////
  activityLog = []
  inteRactData = []
  //////////////////
  countryName = 'English';
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
  coopParams: any;


  constructor(
    public formBuilder: UntypedFormBuilder,
    private http: HttpService,
  ) {
    // const h = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Access-Control-Allow-Origin': '*'
    // });
    // const h = new HttpHeaders(environment.apiOptions.headers);
    // this.httpOptions = {
    //   headers: h
    // };
    this.httpOptions = environment.apiOptions;

    this.coopParams = coopParamOptions

    this.revenueChart = {

      series: this.coopByGeoLocSeries,
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
      colors: this.activeColors(this.locationData),
      labels: [],
    };

    this.salesAnalytics = {
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

    this.sparklineEarning = {
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

    this.sparklineMonthly = {
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

    this.chatData = [
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

    this.transactions = [
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

    /**
     * header figures
     */
    this.statData = [
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

    // this.spark1Chart = {
    //   series: [{
    //     data: [23, 32, 27, 38, 27, 32, 27, 34, 26, 31, 28]
    //   }],
    //   chart: {
    //     type: 'line',
    //     width: 80,
    //     height: 35,
    //     sparkline: {
    //       enabled: true
    //     }
    //   },
    //   stroke: {
    //     width: [3],
    //     curve: 'smooth'
    //   },
    //   colors: ['#5664d2'],

    //   tooltip: {
    //     fixed: {
    //       enabled: false
    //     },
    //     x: {
    //       show: false
    //     },
    //     y: {
    //       title: {
    //         formatter: function (seriesName) {
    //           return ''
    //         }
    //       }
    //     },
    //     marker: {
    //       show: false
    //     }
    //   }
    // }

    // this.spark2Chart = {
    //   series: [{
    //     data: [24, 62, 42, 84, 63, 25, 44, 46, 54, 28, 54]
    //   }],
    //   chart: {
    //     type: 'line',
    //     width: 80,
    //     height: 35,
    //     sparkline: {
    //       enabled: true
    //     }
    //   },
    //   stroke: {
    //     width: [3],
    //     curve: 'smooth'
    //   },
    //   colors: ['#5664d2'],
    //   tooltip: {
    //     fixed: {
    //       enabled: false
    //     },
    //     x: {
    //       show: false
    //     },
    //     y: {
    //       title: {
    //         formatter: function (seriesName) {
    //           return ''
    //         }
    //       }
    //     },
    //     marker: {
    //       show: false
    //     }
    //   }
    // }

    // this.spark3Chart = {
    //   series: [{
    //     data: [42, 31, 42, 34, 46, 38, 44, 36, 42, 32, 54]
    //   }],
    //   chart: {
    //     type: 'line',
    //     width: 80,
    //     height: 35,
    //     sparkline: {
    //       enabled: true
    //     }
    //   },
    //   stroke: {
    //     width: [3],
    //     curve: 'smooth'
    //   },
    //   colors: ['#5664d2'],
    //   tooltip: {
    //     fixed: {
    //       enabled: false
    //     },
    //     x: {
    //       show: false
    //     },
    //     y: {
    //       title: {
    //         formatter: function (seriesName) {
    //           return ''
    //         }
    //       }
    //     },
    //     marker: {
    //       show: false
    //     }
    //   }
    // }
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

    this.fetchData();

    // console.log("DashboardComponent::ngOnInit/coopData:", coopData)

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

  selectedGeoLocations(geoLocationData: IGeoLocation[] = []): IGeoLocation[] {
    return geoLocationData
      .filter(geoData => geoData.cdGeoLocationDisplay)
  }

  /**
   * add a temporary boolean field for controlling which fields display
   * @param geoLocationData 
   * @returns 
   */
  addGeoLocationDisplayField(geoLocationData: IGeoLocation[]): IGeoLocation[] {
    return this.locationData.map((geoData) => {
      geoData.cdGeoLocationDisplay = false;
      return geoData;
    })
  }

  setGeoLocationDisplay(geoLocationData: IGeoLocation[], displayConfig: IDisplayConfig): IGeoLocation[] {
    console.log("DashboardComponent::setGeoLocationDisplay/geoLocationData", geoLocationData)
    console.log("DashboardComponent::setGeoLocationDisplay/displayConfig", displayConfig)
    return this.locationData.map((geoData) => {
      console.log("DashboardComponent::setGeoLocationDisplay/geoData", geoData)
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
    console.log("DashboardComponent::activeColors/geoLocationData:", geoLocationData)
    const locationData = this.selectedGeoLocations(geoLocationData)
    console.log("DashboardComponent::activeColors/locationData:", locationData)
    console.log("", locationData)
    let cols = []
    for (var i in locationData) {
      cols.push(colrs[i])
    }
    return cols
  }

  coopCountSeriesFx(locationId: number): number[] {
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map(coop => Number(coop.coopCount));
  }

  membersCountSeriesFx(locationId: number): number[] {
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map(coop => Number(coop.coopMembersCount));
  }

  coopSavesSharesSeriesFx(locationId: number): number[] {
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map(coop => Number(coop.coopSavesShares));
  }

  coopAssetsSeriesFx(locationId: number): number[] {
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map(coop => Number(coop.coopAssets));
  }

  coopReservesSeriesFx(locationId: number): number[] {
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map(coop => Number(coop.coopReserves));
  }

  coopLoansSeriesFx(locationId: number): number[] {
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map(coop => Number(coop.coopLoans));
  }

  coopMemberPenetrationSeriesFx(locationId: number): number[] {
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map(coop => Number(coop.coopMemberPenetration));
  }

  // Function to filter coopData by cdGeoLocationId and return coopMembersCount
  yearsSeriesFx(locationId: number): number[] {
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map(coop => Number(coop.coopDescription))
  }

  coopDataSeriesFx(locationId: number, locationData: IGeoLocation[]): ICoopDataSeries {
    this.locationData = locationData
    return {
      coopCountSeries: this.coopSavesSharesSeriesFx(locationId),
      membersCountSeries: this.membersCountSeriesFx(locationId),
      coopSavesSharesSeries: this.coopSavesSharesSeriesFx(locationId),
      coopAssetsSeries: this.coopAssetsSeriesFx(locationId),
      coopReservesSeries: this.coopReservesSeriesFx(locationId),
      coopLoansSeries: this.coopLoansSeriesFx(locationId),
      coopMemberPenetrationSeries: this.coopMemberPenetrationSeriesFx(locationId),
    }
  }

  geoLocationDataFx(locationId: number, locationData: IGeoLocation[]) {
    this.locationData = locationData
    return this.locationData
      .filter(location => Number(location.cdGeoLocationId) === locationId)
  }



  /**
   * fetch and set data and refresh display
   */
  fetchData() {
    let postData = this.getPostData()
    this.http.proc(postData).subscribe((resp: any) => {
      this.coopData = resp.data.coopData
      this.locationData = resp.data.geoLocationData
      this.refreshDisplay(this.selectedCoopParam)
    });
  }

  refreshDisplay(selectedCoopParam: string) {
    console.log("DashboardComponent::fetchData/this.locationData/1:", this.locationData)

    this.coopByGeoLocSeries = []
    this.selectedGeoLocations(this.locationData).forEach(gl => {
      const seriesData = this.coopDataSeriesFx(gl.cdGeoLocationId, this.locationData)[selectedCoopParam]
      console.log("DashboardComponent::refreshDisplay()/seriesData", seriesData)
      let si: SeriesItem = {
        name: this.geoLocationDataFx(gl.cdGeoLocationId, this.locationData)[0].cdGeoLocationName,
        type: 'column',
        // data: this.membersCountSeriesFx(gl.cdGeoLocationId)
        data: seriesData
      }
      this.coopByGeoLocSeries.push(si)
    })

    // Example usage:
    const geoId = this.selectedGeoLocations(this.locationData)[0].cdGeoLocationId;

    const yearsArr = this.yearsSeriesFx(geoId);
    console.log("DashboardComponent::fetchData/11")
    console.log("membersCountArr_years:", yearsArr);


    const revenueChart: ChartType = {

      series: this.coopByGeoLocSeries,
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
      colors: this.activeColors(this.locationData),
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


    /**
     * percentage doughnuts
     */
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

    /**
     * header figures
     */
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

    const spark1Chart: ChartType = {
      series: [{
        data: [23, 32, 27, 38, 27, 32, 27, 34, 26, 31, 28]
      }],
      chart: {
        type: 'line',
        width: 80,
        height: 35,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        width: [3],
        curve: 'smooth'
      },
      colors: ['#5664d2'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    }

    const spark2Chart: ChartType = {
      series: [{
        data: [24, 62, 42, 84, 63, 25, 44, 46, 54, 28, 54]
      }],
      chart: {
        type: 'line',
        width: 80,
        height: 35,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        width: [3],
        curve: 'smooth'
      },
      colors: ['#5664d2'],
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    }

    const spark3Chart: ChartType = {
      series: [{
        data: [42, 31, 42, 34, 46, 38, 44, 36, 42, 32, 54]
      }],
      chart: {
        type: 'line',
        width: 80,
        height: 35,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        width: [3],
        curve: 'smooth'
      },
      colors: ['#5664d2'],
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    }



    this.revenueChart = revenueChart;
    this.salesAnalytics = salesAnalytics;
    this.sparklineEarning = sparklineEarning;
    this.sparklineMonthly = sparklineMonthly;
    this.chatData = chatData;
    this.transactions = transactions;
    this.statData = statData;



    let chartCollection = {
      comparisonXYChart: revenueChart,
      comparisonDoughnuts: salesAnalytics,
      headerFigures: statData,
      percentageDoughnuts: sparklineEarning,
      geoLocationsPanel: this.locationData,
      coopPanel: this.coopData,
      miniCharts: [spark1Chart, spark2Chart, spark3Chart],
      activityFeed: this.activityLog,
      interactPanel: this.inteRactData,
      dataTable: this.coopData
    }

    // this.chartsConfig.coopCount = chartCollection


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
    this.chatData = []
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
    console.log("DashboardComponent::selectMail/id", id)
    if (event.target.checked) {
      console.log("DashboardComponent::selectMail/1")
      this.emailIds.push(id);
      this.locationData = this.setGeoLocationDisplay(this.locationData, { cdGeoLocationId: id, cdGeoLocationDisplay: true })
      console.log("DashboardComponent::selectMail/this.locationData", this.locationData)
    } else {
      console.log("DashboardComponent::selectMail/2")
      this.emailIds.splice(this.emailIds.indexOf(id), 1);
      this.locationData = this.setGeoLocationDisplay(this.locationData, { cdGeoLocationId: id, cdGeoLocationDisplay: false })
      console.log("DashboardComponent::selectMail/this.locationData/3:", this.locationData)
    }
    console.log("DashboardComponent::selectMail/this.locationData/4:", this.locationData)
    this.refreshDisplay(this.selectedCoopParam)
  }

  onSelectCoopParam() {
    console.log('DashboardComponent::onSelectCoopParam()/Selected value:', this.selectedCoopParam);
    this.refreshDisplay(this.selectedCoopParam)
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
// function setCoopData(cd: any, arg1: any) {
//   throw new Error('Function not implemented.');
// }

