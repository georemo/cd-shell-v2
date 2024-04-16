const CD_API = "http://cd-api-92:3001"
const CD_SIO = "http://cd-api-93:3002"

const PROXY_CONFIG = [
{
	context: ["/"],
	target: CD_API,
	secure: false
},
{
	context: ["/"],
	target: CD_SIO,
	secure: false
},
];

module.exports = PROXY_CONFIG;