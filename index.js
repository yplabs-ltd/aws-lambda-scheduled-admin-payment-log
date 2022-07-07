const constants = require("./constants");
const api = require("./api")
const sqs = require("./sqs");
const {serialize, filterFutureTime} = require("./utils")

exports.handler = async (event, context, callback) => {
    await sqs.fetchMessagesFromQueue()
        .then(serialize)
        .then(filterFutureTime)
        .then(api.apiCall)
        .then(sqs.deleteMessageFromQueue)
        .catch(err =>{console.log(err.config)})
    
    return  {
        statusCode: 200,
        body: JSON.stringify('SUCCESS_EXECUTED_SCHEDULED_PAYMENT'),
    };
}
