const CD_API = "https://cd-api.co.ke"
const CD_SIO = "https://cd-api.co.ke"

const PROXY_CONFIG = [
{
	context: ["/api"],
	target: CD_API,
	secure: false
},
{
	context: ["/sio"],
	target: CD_SIO,
	secure: false
},
];

module.exports = PROXY_CONFIG;