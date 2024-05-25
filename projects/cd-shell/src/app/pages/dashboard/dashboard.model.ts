export interface ChartType {
    series?: any;
    plotOptions?: any;
    stroke?: any;
    dataLabels?: any;
    chart?: any;
    legend?: any;
    colors?: any;
    labels?: any;
    tooltip?: any;
}

export interface SeriesItem {
    name: string;
    type: string;
    data: number[];
}

export interface Stat {
    title: string;
    icon: string;
    value: string;
}

export interface Chat {
    id?: number;
    name?: string;
    message?: string;
    image?: string;
    time?: string;
    align?: string;
    text?: string;
}

export interface Transaction {
    orderid: string;
    date: string;
    billingname: string;
    total: string;
    paymentstatus: string;
}

// Define the interface ICoopType
export interface ICoopType {
    coopId: number;
    coopGuid: string;
    coopName: string | null;
    coopTypeGuid: number | null;
    coopTypeName: string | null;
    docId: number | null;
    coopDescription: string | null;
    coopTypeId: number | null;
    cdGeoLocationId: number | null;
    coopCount: number | null;
    coopMembersCount: number | null;
    coopSavesShares: number | null;
    coopLoans: number | null;
    coopAssets: number | null;
    coopMemberPenetration: number | null;
    coopDateLabel: string | null;
    coopWoccu: boolean | null;
    coopEnabled: boolean | null;
    coopDisplay: boolean | null;
    coopReserves: number | null;
    parentGuid: string | null;
    cdGeoLocationName: string | null;
    cdGeoPoliticalTypeId: number | null;
};

export interface IGeoLocation {
    cdGeoLocationId: number,
    cdGeoLocationGuid: string | null,
    cdGeoLocationName: string | null,
    cdGeoLocationDescription: string | null,
    docId: number | null,
    lat: string | null,
    long: string | null,
    cdGeoBoundaryData: any,
    cdGeoLocationCode: string | null,
    cdGeoLocationIcon: any,
    back4appObectId: string | null,
    cdGeoPoliticalTypeId: number | null,
    cdGeoPoliticalParentId: number | null,
    cdGeoLocationNameAlt: any,
    cdGeoLocationAssoc: any,
    cdGeoLocationPopulation: number | null,
    cdGeoLocationEnabled: boolean | null
    cdGeoLocationDisplay?: boolean;
}

export interface IDisplayConfig {
    cdGeoLocationId: number,
    cdGeoLocationDisplay: boolean
}

export interface Email {
    id: number;
    text?: string;
    title: string;
    subject: string;
    date: string;
    unread?: boolean;
    flag?: string;
    checked?: boolean;
}

export interface ICoopDataSeries {
    coopCountSeries: number[];
    membersCountSeries: number[];
    coopSavesSharesSeries: number[];
    coopAssetsSeries: number[];
    coopReservesSeries: number[];
    coopLoansSeries: number[];
    coopMemberPenetrationSeries: number[];
}
