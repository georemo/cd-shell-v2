const CD_API = "https://34.224.98.250"
const CD_SIO = "https://34.224.98.250"

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