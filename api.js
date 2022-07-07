
const axios= require("axios");
const constants = require("./constants");

exports.apiCall = function apiCall(messages) {
    if (messages.length === 0) {
        return []
    }
    const requests = messages.map(message => createAxiosRequest(message))
    return Promise.all(requests)
        .then(resps => resps.filter(res => res.status === 200).map(res => {
            const url = new URL(res.config.url)
            const pk = url.pathname.split("/")[4]
            return Number(pk)
        }))
        .then(log_ids => {
            return messages.filter(msg => {
                return log_ids.includes(msg.body.pk)
            })
        })
}


function createAxiosRequest(message) {
    console.log(`Token ${message.body.token}`)
    const headers={
            Authorization: `Token ${message.body.token}`
        }
    console.log(headers)
    
    const axiosIns = axios({method: 'post', url: constants.API_URL(message.body.pk), headers: headers})
        

    return axiosIns
}