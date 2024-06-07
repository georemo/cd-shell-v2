import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CdRequest, ICdResponse } from '@corpdesk/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DEFAULT_ARGS, DEFAULT_DAT, DEFAULT_ENVELOPE_GET, ICdRequest, IQuery, SYS_CTX } from './IBase';
import { ICoopType, IGeoLocation } from './dashboard.model';

// interface ICoopType {
//     coopId: number;
//     coopGuid: string;
//     coopName: string | null;
//     coopTypeGuid: number | null;
//     coopTypeName: string | null;
//     docId: number | null;
//     coopDescription: string | null;
//     coopTypeId: number | null;
//     cdGeoLocationId: number | null;
//     coopCount: number | null;
//     coopMembersCount: number | null;
//     coopSavesShares: number | null;
//     coopLoans: number | null;
//     coopAssets: number | null;
//     coopMemberPenetration: number | null;
//     coopDateLabel: string | null;
//     coopWoccu: boolean | null;
//     coopReserves: number | null;
//     parentGuid: string | null;
//     cdGeoLocationName: string | null;
//     cdGeoPoliticalTypeId: number | null;
// };

// interface IGeoLocation {
//     cdGeoLocationId: number,
//     cdGeoLocationGuid: string | null,
//     cdGeoLocationName: string | null,
//     cdGeoLocationDescription: string | null,
//     docId: number | null,
//     lat: string | null,
//     long: string | null,
//     cdGeoBoundaryData: any,
//     cdGeoLocationCode: string | null,
//     cdGeoLocationIcon: any,
//     back4appObectId: string | null,
//     cdGeoPoliticalTypeId: number | null,
//     cdGeoPoliticalParentId: number | null,
//     cdGeoLocationNameAlt: any,
//     cdGeoLocationAssoc: any,
//     cdGeoLocationPopulation: number | null,
//     cdGeoLocationEnabled: boolean | null
// }

// const YEAR_MIN = 2016;
// const TZ = 111;
// const BEN = 119;

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    debug = false;
    postData: ICdRequest;
    module = '';
    controller = '';
    resp$: Observable<ArrayBuffer> = new Observable<ArrayBuffer>();
    token: any;
    params: CdRequest = {
        ctx: '',
        m: '',
        c: '',
        a: '',
        dat: {
            token: '',
        },
        args: {}
    };

    // coopData: ICoopType[] = []
    // locationData: IGeoLocation[] = []

    constructor(private http: HttpClient) {
        
    }

    // init() {
    //     let postUrl = "https://cd-shell.asdap.africa:8181"
    //     let postData = {
    //         ctx: "App",
    //         m: "Coops",
    //         c: "Coop",
    //         a: "StatsByGeoLocation",
    //         dat: {
    //             "f_vals": [
    //                 {
    //                     "query": {
    //                         "where": [
    //                             {
    //                                 "cdGeoLocationId": 119
    //                             },
    //                             {
    //                                 "cdGeoLocationId": 111
    //                             }
    //                         ]
    //                     }
    //                 }
    //             ],
    //             "token": "3ffd785f-e885-4d37-addf-0e24379af338"
    //         },
    //         "args": {}
    //     }

    //     // this.resp$ = this.get$(postData)
    //     this.http.post(postUrl, postData).pipe(
    //         map((response: ICdResponse) => {
    //           // Extract coopData array from the response
    //           const coopData = response.data.coopData;
          
    //           // Filter coopData array by cdGeoLocationId
    //           const filteredCoopData = coopData.filter(coop => {
    //             return coop.cdGeoLocationId === TZ;
    //           });
          
    //           // Extract and map coopMembersCount from the filteredCoopData array
    //           const coopMembersCountArray = filteredCoopData.map(coop => {
    //             return coop.coopMembersCount;
    //           });
          
    //           return coopMembersCountArray;
    //         })
    //     );

    //     let coopData = this.resp$.data.coopData.data
    //     let locationData = resp$.data.geoLocationData.data

    //     const membersCountArr_TZ = membersCountArrFx(TZ);
    //     console.log("membersCountArr_TZ:", membersCountArr_TZ);
    //     const locationTZ = geoLocationDataFx(TZ)
    //     const membersCountArr_BEN = membersCountArrFx(BEN);
    //     console.log("membersCountArr_BEN:", membersCountArr_BEN);
    //     const locationBEN = geoLocationDataFx(BEN)
    //     const yearsArr = yearsArrFx(TZ);
    //     console.log("membersCountArr_years:", yearsArr);
    // }

    proc(params: CdRequest) {
        console.log('', params)
        return this.http.post(environment.apiEndpoint, params, environment.apiOptions)
    }

    // procPusher(pusherPbase/ServerService::proc()/params:arams: any) {
    //     console.log('base/ServerService::procPusher()/params:', pusherParams)
    //     return this.http.post(`${environment.sioHost}:${environment.SOCKET_IO_PORT}`, pusherParams, environment.pusherOptions)
    // }

    



// /**
// * module and controller are filled in by default from the client...but there
// * are circumstances where you will need to override
// * @param defaultEnvelope 
// * @param q 
// * @param cdToken 
// * @param module 
// * @param controller 
// */
// setEnvelope(defaultEnvelope: ICdRequest, q: IQuery, cdToken: string, ctx: string | null = null, module: string | null = null, controller: string | null = null) {
//     console.log('BaseService::setEnvelope$()/q:', q)
//     console.log('BaseService::setEnvelope$()/cdToken:', cdToken)
//     this.postData = defaultEnvelope;
//     this.initEnvelope(ctx, module, controller);
//     this.postData.dat.f_vals[0].query = q;
//     this.postData.dat.token = cdToken;
//     console.log('BaseService::setEnvelope$()/this.postData:', this.postData)
// }

// initEnvelope(ctx: string | null = null, module: string | null = null, controller: string | null = null) {
//     if (ctx) {
//         this.postData.ctx = ctx;
//     }
//     if (module) {
//         this.postData.m = module;
//     } else {
//         this.postData.m = this.module;
//     }
//     if (controller) {
//         this.postData.c = controller;
//     } else {
//         this.postData.c = this.controller;
//     }
// }

// get$(postData: any) {
//     // this.setEnvelope(DEFAULT_ENVELOPE_GET, q, cdToken, ctx, module, controller);
//     // console.log('get$()/this.postData:', JSON.stringify(this.postData))
//     return this.proc(postData);
// }

// membersCountArrFx(locationId: number): number[] {
//     return this.coopData
//         .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
//         .map(coop => Number(coop.coopMembersCount));
// }

// // Function to filter coopData by cdGeoLocationId and return coopMembersCount
// yearsArrFx(locationId: number): number[] {
//     return this.coopData
//         .filter(coop => Number(coop.cdGeoLocationId) === locationId && Number(coop.coopDescription) > YEAR_MIN)
//         .map(coop => Number(coop.coopDescription))
// }

// geoLocationDataFx(locationId: number) {
//     return this.locationData
//         .filter(location => Number(location.cdGeoLocationId) === locationId)
// }

}


