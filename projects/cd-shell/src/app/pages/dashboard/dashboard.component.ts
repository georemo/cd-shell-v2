import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { latLng, tileLayer } from 'leaflet';


import { ChartType, Stat, Chat, Transaction, SeriesItem, IGeoLocation, ICoopType, IDisplayConfig, Email, ICoopDataSeries, CoopData } from './dashboard.model';
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
  transactions: CoopData[];
  statData: Stat[];

  coopData: ICoopType[]
  selectedCoopParam = "coopCountSeries"
  chartTitle = "No of SACCOs"
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
        coopId: 309,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2017",
        docId: 20118,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 64,
        coopMembersCount: 76570,
        coopSavesShares: 22287872,
        coopLoans: 15778522,
        coopAssets: 25636089,
        coopMemberPenetration: 7.2,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: null,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 310,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2017",
        docId: 20119,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 481,
        coopMembersCount: 577194,
        coopSavesShares: 156601854,
        coopLoans: 90060125,
        coopAssets: 187307016,
        coopMemberPenetration: 3.53,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 20495302,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 318,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2017",
        docId: 20127,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 39,
        coopMembersCount: 102421,
        coopSavesShares: 13394093,
        coopLoans: 12761587,
        coopAssets: 20473117,
        coopMemberPenetration: 1.07,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 3953882,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 327,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2017",
        docId: 20136,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 99,
        coopMembersCount: 60652,
        coopSavesShares: 149176422,
        coopLoans: 72510189,
        coopAssets: 167195179,
        coopMemberPenetration: 7.59,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 18018757,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 328,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2017",
        docId: 20137,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 5559,
        coopMembersCount: 1153248,
        coopSavesShares: null,
        coopLoans: 545000000,
        coopAssets: 599500000,
        coopMemberPenetration: 0,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: null,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 337,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2018",
        docId: 20146,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 72,
        coopMembersCount: 78451,
        coopSavesShares: 25277688,
        coopLoans: 16695516,
        coopAssets: 22235254,
        coopMemberPenetration: 7.38,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 2222635,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 338,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2018",
        docId: 20147,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 566,
        coopMembersCount: 862638,
        coopSavesShares: 231395127,
        coopLoans: 49909922,
        coopAssets: 297683637,
        coopMemberPenetration: 5.28,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 4822577,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 345,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2018",
        docId: 20154,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 39,
        coopMembersCount: 122905,
        coopSavesShares: 20240447,
        coopLoans: 17742529,
        coopAssets: 26961476,
        coopMemberPenetration: 1.29,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 5503201,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 354,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2018",
        docId: 20163,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 113,
        coopMembersCount: 50843,
        coopSavesShares: 87190538,
        coopLoans: 62761842,
        coopAssets: 124270827,
        coopMemberPenetration: 6.37,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 5743389,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 355,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2018",
        docId: 20164,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 6138,
        coopMembersCount: 1584285,
        coopSavesShares: 234091304,
        coopLoans: 569069565,
        coopAssets: 569565217,
        coopMemberPenetration: 5.5,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 178578261,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 364,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2019",
        docId: 20173,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 69,
        coopMembersCount: 84065,
        coopSavesShares: 31946330,
        coopLoans: 21047304,
        coopAssets: 34642013,
        coopMemberPenetration: 6.72,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 12187884,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 365,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2019",
        docId: 20174,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 510,
        coopMembersCount: 783815,
        coopSavesShares: 236149951,
        coopLoans: 117717798,
        coopAssets: 330490125,
        coopMemberPenetration: 4.33,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 56950177,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 372,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2019",
        docId: 20181,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 39,
        coopMembersCount: 145385,
        coopSavesShares: 25468249,
        coopLoans: 21882542,
        coopAssets: 34901578,
        coopMemberPenetration: 1.45,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 7618245,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 381,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2019",
        docId: 20190,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 123,
        coopMembersCount: 54022,
        coopSavesShares: 97988906,
        coopLoans: 62454746,
        coopAssets: null,
        coopMemberPenetration: 8.09,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 8218696,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 382,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2019",
        docId: 20191,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 6178,
        coopMembersCount: 2447332,
        coopSavesShares: 266035615,
        coopLoans: 246640851,
        coopAssets: 293857406,
        coopMemberPenetration: 7.88,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 27821791,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 391,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2020",
        docId: 20200,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 71,
        coopMembersCount: 91551,
        coopSavesShares: 34086674,
        coopLoans: 22327438,
        coopAssets: 37540135,
        coopMemberPenetration: 7.08,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 14630634,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 392,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2020",
        docId: 20201,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 489,
        coopMembersCount: 884495,
        coopSavesShares: 312953368,
        coopLoans: 157044676,
        coopAssets: 387734403,
        coopMemberPenetration: 4.77,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 1942015,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 399,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2020",
        docId: 20208,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 39,
        coopMembersCount: 158972,
        coopSavesShares: 29247057,
        coopLoans: 28209716,
        coopAssets: 42032824,
        coopMemberPenetration: 1.53,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 10327547,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 408,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2020",
        docId: 20217,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 126,
        coopMembersCount: 62637,
        coopSavesShares: 103977252,
        coopLoans: 57568148,
        coopAssets: 138342634,
        coopMemberPenetration: 9.22,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 12990076,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 409,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2020",
        docId: 20218,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 6178,
        coopMembersCount: 2447332,
        coopSavesShares: 266035615,
        coopLoans: 246640851,
        coopAssets: 293857406,
        coopMemberPenetration: 7.88,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 27821791,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 418,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2021",
        docId: 20227,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 71,
        coopMembersCount: 91551,
        coopSavesShares: 34086674,
        coopLoans: 22327438,
        coopAssets: 37540135,
        coopMemberPenetration: 7.08,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 14630634,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 419,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2021",
        docId: 20228,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 490,
        coopMembersCount: 983023,
        coopSavesShares: 364324949,
        coopLoans: 191684979,
        coopAssets: 444207887,
        coopMemberPenetration: 5.17,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 60767704,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 426,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2021",
        docId: 20235,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 40,
        coopMembersCount: 173245,
        coopSavesShares: 29317888,
        coopLoans: 30654682,
        coopAssets: 43976124,
        coopMemberPenetration: 1.61,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 11757619,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 435,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2021",
        docId: 20244,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 129,
        coopMembersCount: 61589,
        coopSavesShares: 125257135,
        coopLoans: 101102017,
        coopAssets: 151916073,
        coopMemberPenetration: 8.9,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 10734888,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 436,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2021",
        docId: 20245,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 6178,
        coopMembersCount: 2447332,
        coopSavesShares: 266035615,
        coopLoans: 246640851,
        coopAssets: 293857406,
        coopMemberPenetration: 7.88,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 27321791,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 20,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2022",
        docId: 19532,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 1900,
        coopMembersCount: 1524513,
        coopSavesShares: 282765230,
        coopLoans: 293650219,
        coopAssets: 381772532,
        coopMemberPenetration: 4.3,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 25378201,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 13,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2022",
        docId: 19525,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 40,
        coopMembersCount: 170165,
        coopSavesShares: 26300000,
        coopLoans: 28700000,
        coopAssets: 40000000,
        coopMemberPenetration: 1.4,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 10900000,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 8,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2022",
        docId: 19520,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 490,
        coopMembersCount: 983023,
        coopSavesShares: 374621801,
        coopLoans: 199947263,
        coopAssets: 463354799,
        coopMemberPenetration: 4.9,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 67403773,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 7,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2022",
        docId: 19519,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 71,
        coopMembersCount: 102477,
        coopSavesShares: 36740000,
        coopLoans: 32000000,
        coopAssets: 45460000,
        coopMemberPenetration: 6.9,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 4500000,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 6,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2022",
        docId: 19518,
        coopTypeId: 105,
        cdGeoLocationId: null,
        coopCount: 129,
        coopMembersCount: 65448,
        coopSavesShares: 104000000,
        coopLoans: 98000000,
        coopAssets: 119000000,
        coopMemberPenetration: 8.9,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 16536240,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
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
    this.breadCrumbItems = [{ label: 'ASDAP' }, { label: 'Dashboard', active: true }];
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
              "where": { cdGeoLocationEnabled: true, cdGeoLocationDisplay: true }
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
    console.log("DashboardComponent::coopCountSeriesFx/this.coopData:", this.coopData)
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map((coop) => {
        console.log("DashboardComponent::membersCountSeriesFx/coop.coopCount:", coop.coopCount)
        console.log("DashboardComponent::membersCountSeriesFx/coop.coopDateLabel:", coop.coopDateLabel)
        return Number(coop.coopCount)
      });
  }

  membersCountSeriesFx(locationId: number): number[] {
    console.log("DashboardComponent::membersCountSeriesFx/this.coopData:", this.coopData)
    return this.coopData
      .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
      .map((coop) => {
        console.log("DashboardComponent::membersCountSeriesFx/coop.coopMembersCount:", coop.coopMembersCount)
        console.log("DashboardComponent::membersCountSeriesFx/coop.coopDateLabel:", coop.coopDateLabel)
        return Number(coop.coopMembersCount)
      });
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
    const cds = {
      coopCountSeries: this.coopCountSeriesFx(locationId),
      membersCountSeries: this.membersCountSeriesFx(locationId),
      coopSavesSharesSeries: this.coopSavesSharesSeriesFx(locationId),
      coopAssetsSeries: this.coopAssetsSeriesFx(locationId),
      coopReservesSeries: this.coopReservesSeriesFx(locationId),
      coopLoansSeries: this.coopLoansSeriesFx(locationId),
      coopMemberPenetrationSeries: this.coopMemberPenetrationSeriesFx(locationId),
    }
    console.log("DashboardComponent::coopDataSeriesFx/cds:", cds)
    return cds
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
    // this.selectedCoopParam = selectedCoopParam;
    

    this.coopByGeoLocSeries = []
    this.selectedGeoLocations(this.locationData).forEach(gl => {
      const seriesData = this.coopDataSeriesFx(gl.cdGeoLocationId, this.locationData)[selectedCoopParam]
      console.log("DashboardComponent::refreshDisplay()/selectedCoopParam", selectedCoopParam)
      console.log("DashboardComponent::refreshDisplay()/seriesData", seriesData)
      let si: SeriesItem = {
        name: this.geoLocationDataFx(gl.cdGeoLocationId, this.locationData)[0].cdGeoLocationName,
        type: 'column',
        // data: this.membersCountSeriesFx(gl.cdGeoLocationId)
        data: seriesData
      }
      console.log("DashboardComponent::refreshDisplay()/si", si)
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
        coopId: 309,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2017",
        docId: 20118,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 64,
        coopMembersCount: 76570,
        coopSavesShares: 22287872,
        coopLoans: 15778522,
        coopAssets: 25636089,
        coopMemberPenetration: 7.2,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: null,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 310,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2017",
        docId: 20119,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 481,
        coopMembersCount: 577194,
        coopSavesShares: 156601854,
        coopLoans: 90060125,
        coopAssets: 187307016,
        coopMemberPenetration: 3.53,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 20495302,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 318,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2017",
        docId: 20127,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 39,
        coopMembersCount: 102421,
        coopSavesShares: 13394093,
        coopLoans: 12761587,
        coopAssets: 20473117,
        coopMemberPenetration: 1.07,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 3953882,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 327,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2017",
        docId: 20136,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 99,
        coopMembersCount: 60652,
        coopSavesShares: 149176422,
        coopLoans: 72510189,
        coopAssets: 167195179,
        coopMemberPenetration: 7.59,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 18018757,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 328,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2017",
        docId: 20137,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 5559,
        coopMembersCount: 1153248,
        coopSavesShares: null,
        coopLoans: 545000000,
        coopAssets: 599500000,
        coopMemberPenetration: 0,
        coopDateLabel: "2017-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: null,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 337,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2018",
        docId: 20146,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 72,
        coopMembersCount: 78451,
        coopSavesShares: 25277688,
        coopLoans: 16695516,
        coopAssets: 22235254,
        coopMemberPenetration: 7.38,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 2222635,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 338,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2018",
        docId: 20147,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 566,
        coopMembersCount: 862638,
        coopSavesShares: 231395127,
        coopLoans: 49909922,
        coopAssets: 297683637,
        coopMemberPenetration: 5.28,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 4822577,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 345,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2018",
        docId: 20154,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 39,
        coopMembersCount: 122905,
        coopSavesShares: 20240447,
        coopLoans: 17742529,
        coopAssets: 26961476,
        coopMemberPenetration: 1.29,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 5503201,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 354,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2018",
        docId: 20163,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 113,
        coopMembersCount: 50843,
        coopSavesShares: 87190538,
        coopLoans: 62761842,
        coopAssets: 124270827,
        coopMemberPenetration: 6.37,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 5743389,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 355,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2018",
        docId: 20164,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 6138,
        coopMembersCount: 1584285,
        coopSavesShares: 234091304,
        coopLoans: 569069565,
        coopAssets: 569565217,
        coopMemberPenetration: 5.5,
        coopDateLabel: "2018-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 178578261,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 364,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2019",
        docId: 20173,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 69,
        coopMembersCount: 84065,
        coopSavesShares: 31946330,
        coopLoans: 21047304,
        coopAssets: 34642013,
        coopMemberPenetration: 6.72,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 12187884,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 365,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2019",
        docId: 20174,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 510,
        coopMembersCount: 783815,
        coopSavesShares: 236149951,
        coopLoans: 117717798,
        coopAssets: 330490125,
        coopMemberPenetration: 4.33,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 56950177,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 372,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2019",
        docId: 20181,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 39,
        coopMembersCount: 145385,
        coopSavesShares: 25468249,
        coopLoans: 21882542,
        coopAssets: 34901578,
        coopMemberPenetration: 1.45,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 7618245,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 381,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2019",
        docId: 20190,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 123,
        coopMembersCount: 54022,
        coopSavesShares: 97988906,
        coopLoans: 62454746,
        coopAssets: null,
        coopMemberPenetration: 8.09,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 8218696,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 382,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2019",
        docId: 20191,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 6178,
        coopMembersCount: 2447332,
        coopSavesShares: 266035615,
        coopLoans: 246640851,
        coopAssets: 293857406,
        coopMemberPenetration: 7.88,
        coopDateLabel: "2019-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 27821791,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 391,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2020",
        docId: 20200,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 71,
        coopMembersCount: 91551,
        coopSavesShares: 34086674,
        coopLoans: 22327438,
        coopAssets: 37540135,
        coopMemberPenetration: 7.08,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 14630634,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 392,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2020",
        docId: 20201,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 489,
        coopMembersCount: 884495,
        coopSavesShares: 312953368,
        coopLoans: 157044676,
        coopAssets: 387734403,
        coopMemberPenetration: 4.77,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 1942015,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 399,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2020",
        docId: 20208,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 39,
        coopMembersCount: 158972,
        coopSavesShares: 29247057,
        coopLoans: 28209716,
        coopAssets: 42032824,
        coopMemberPenetration: 1.53,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 10327547,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 408,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2020",
        docId: 20217,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 126,
        coopMembersCount: 62637,
        coopSavesShares: 103977252,
        coopLoans: 57568148,
        coopAssets: 138342634,
        coopMemberPenetration: 9.22,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 12990076,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 409,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2020",
        docId: 20218,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 6178,
        coopMembersCount: 2447332,
        coopSavesShares: 266035615,
        coopLoans: 246640851,
        coopAssets: 293857406,
        coopMemberPenetration: 7.88,
        coopDateLabel: "2020-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 27821791,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 418,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2021",
        docId: 20227,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 71,
        coopMembersCount: 91551,
        coopSavesShares: 34086674,
        coopLoans: 22327438,
        coopAssets: 37540135,
        coopMemberPenetration: 7.08,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 14630634,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 419,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2021",
        docId: 20228,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 490,
        coopMembersCount: 983023,
        coopSavesShares: 364324949,
        coopLoans: 191684979,
        coopAssets: 444207887,
        coopMemberPenetration: 5.17,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 60767704,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 426,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2021",
        docId: 20235,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 40,
        coopMembersCount: 173245,
        coopSavesShares: 29317888,
        coopLoans: 30654682,
        coopAssets: 43976124,
        coopMemberPenetration: 1.61,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 11757619,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 435,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2021",
        docId: 20244,
        coopTypeId: 105,
        cdGeoLocationId: 112,
        coopCount: 129,
        coopMembersCount: 61589,
        coopSavesShares: 125257135,
        coopLoans: 101102017,
        coopAssets: 151916073,
        coopMemberPenetration: 8.9,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 10734888,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 436,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2021",
        docId: 20245,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 6178,
        coopMembersCount: 2447332,
        coopSavesShares: 266035615,
        coopLoans: 246640851,
        coopAssets: 293857406,
        coopMemberPenetration: 7.88,
        coopDateLabel: "2021-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 27321791,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 20,
        coopGuid: "",
        coopName: "Tanzania",
        coopDescription: "2022",
        docId: 19532,
        coopTypeId: 105,
        cdGeoLocationId: 111,
        coopCount: 1900,
        coopMembersCount: 1524513,
        coopSavesShares: 282765230,
        coopLoans: 293650219,
        coopAssets: 381772532,
        coopMemberPenetration: 4.3,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 25378201,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 13,
        coopGuid: "",
        coopName: "Malawi",
        coopDescription: "2022",
        docId: 19525,
        coopTypeId: 105,
        cdGeoLocationId: 115,
        coopCount: 40,
        coopMembersCount: 170165,
        coopSavesShares: 26300000,
        coopLoans: 28700000,
        coopAssets: 40000000,
        coopMemberPenetration: 1.4,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 10900000,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 8,
        coopGuid: "",
        coopName: "Ghana",
        coopDescription: "2022",
        docId: 19520,
        coopTypeId: 105,
        cdGeoLocationId: 113,
        coopCount: 490,
        coopMembersCount: 983023,
        coopSavesShares: 374621801,
        coopLoans: 199947263,
        coopAssets: 463354799,
        coopMemberPenetration: 4.9,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 67403773,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 7,
        coopGuid: "",
        coopName: "Gambia",
        coopDescription: "2022",
        docId: 19519,
        coopTypeId: 105,
        cdGeoLocationId: 114,
        coopCount: 71,
        coopMembersCount: 102477,
        coopSavesShares: 36740000,
        coopLoans: 32000000,
        coopAssets: 45460000,
        coopMemberPenetration: 6.9,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 4500000,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
      },
      {
        coopId: 6,
        coopGuid: "",
        coopName: "Eswatini",
        coopDescription: "2022",
        docId: 19518,
        coopTypeId: 105,
        cdGeoLocationId: null,
        coopCount: 129,
        coopMembersCount: 65448,
        coopSavesShares: 104000000,
        coopLoans: 98000000,
        coopAssets: 119000000,
        coopMemberPenetration: 8.9,
        coopDateLabel: "2022-12-31T20:59:59.000Z",
        coopWoccu: false,
        coopReserves: 16536240,
        coopRefId: null,
        coopEnabled: true,
        coopDisplay: null
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

  onSelectCoopParam(event: Event):void {
    console.log('DashboardComponent::onSelectCoopParam()/Selected value:', this.selectedCoopParam);
    const selectElement = event.target as HTMLSelectElement;
    this.chartTitle = selectElement.options[selectElement.selectedIndex].text;
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

