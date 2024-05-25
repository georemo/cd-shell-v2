import { ICoopType, IDisplayConfig, IGeoLocation } from "./dashboard.model";

let YEAR_MIN = 2016


const colrs = [
    '#FF5733', '#33FF57', '#5733FF', '#FF33A1', '#A1FF33', '#33A1FF',
    '#FF336A', '#6AFF33', '#336AFF', '#33FF9C', '#9CFF33', '#FF9C33',
    '#33FFF7', '#F733FF', '#FFF733', '#33FFB9', '#B9FF33', '#FFB933',
    '#33FFDA', '#DAFF33', '#FF33E0', '#E0FF33', '#33E0FF', '#FF33D3',
    '#D3FF33', '#33D3FF', '#FF33E9', '#E9FF33', '#33E9FF', '#FF3363',
    '#63FF33', '#3363FF', '#FF33F2', '#F2FF33', '#33F2FF', '#FF33A6',
    '#A6FF33', '#33A6FF', '#FF3399', '#99FF33', '#3399FF', '#FF33C7',
    '#C7FF33', '#33C7FF', '#FF338F', '#8FFF33', '#338FFF', '#FF33E5',
    '#E5FF33', '#33E5FF', '#FF33B0', '#B0FF33', '#33B0FF', '#FF33FD',
    '#FDFF33', '#33FDFF', '#FF33D9', '#D9FF33', '#33D9FF', '#FF336D',
    '#6DFF33', '#336DFF'
];

const GeoLocationDisplayArr: IDisplayConfig[] = [
    { cdGeoLocationId: 111, cdGeoLocationDisplay: true },
    { cdGeoLocationId: 112, cdGeoLocationDisplay: false },
    { cdGeoLocationId: 113, cdGeoLocationDisplay: true },
    { cdGeoLocationId: 114, cdGeoLocationDisplay: false },
    { cdGeoLocationId: 115, cdGeoLocationDisplay: false }
]

const emailData = [
    {
        id: 112,
        title: 'Eswatini',
        subject: '',
        date: '',
        flag: 'assets/images/flags/flags-3/es.png',
        checked: true
    },
    {
        id: 114,
        title: 'Gambia',
        subject: '',
        date: '',
        flag: 'assets/images/flags/flags-3/ga.png',
        checked: true
    },
    {
        id: 113,
        title: 'Ghana',
        subject: ' ',
        date: '',
        flag: 'assets/images/flags/flags-3/gh.png',
        checked: true
    },
    {
        id: 115,
        title: 'Malawi',
        subject: '',
        date: '',
        flag: 'assets/images/flags/flags-3/mw.png',
        checked: true
    },
    {
        id: 5,
        title: 'Tanzania',
        subject: '',
        date: '',
        flag: 'assets/images/flags/flags-3/tz.png',
        checked: true
    }
];

// <option value="coopCountSeries">No. of COOPs</option>
//               <option value="membersCountSeries">No. of Members</option>
//               <option value="coopSavesSharesSeries">Savings and Shares</option>
//               <option value="coopAssetsSeries">Assets</option>
//               <option value="coopLoansSeries">Loans</option>
//               <option value="coopMemberPenetrationSeries">Penetration</option>

const coopParamOptions = [
    { label: 'No. of COOPs', value: 'coopCountSeries' },
    { label: 'No. of Members', value: 'membersCountSeries' },
    { label: 'Savings and Shares', value: 'coopSavesSharesSeries' },
    { label: 'Assets', value: 'coopAssetsSeries' },
    { label: 'Loans', value: 'coopLoansSeries' },
    { label: 'Penetration', value: 'coopMemberPenetrationSeries' },
];




// export function setCoopData(cd: ICoopType[]){
//     coopData = cd
// }

// export function getCoopData():ICoopType[]{
//     return coopData
// }



export { colrs, YEAR_MIN, GeoLocationDisplayArr, emailData, coopParamOptions };
