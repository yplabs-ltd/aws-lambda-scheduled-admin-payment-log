const moment = require('moment-timezone');

// message를 serialize 합니다.
exports.serialize = function serialize(messages) {
    if (messages.Messages) {
        return messages.Messages.map(message => {
            return {
                id: message.MessageId,
                receipt_handle: message.ReceiptHandle,
                body: JSON.parse(message.Body)
            }
        }).map((message) => { 
            const countryCode = message.body.country_code 
            const timezone = moment.tz.zonesForCountry(countryCode)[0]
            message.timezone = timezone
            message.body.scheduled_at = moment.tz(message.body.scheduled_at, "MM/DD/YYYY, HH:mm:ss", timezone)
            return message
        })
    }
    return []
}



// 지금 기준으로 과거 시간만 남깁니다.
exports.filterFutureTime = function filterFutureTime(messages) {
    return messages.map(m => {
        m.now = moment().tz(m.timezone)
        return m
    }).filter(message => message.body.scheduled_at <= message.now) 
}