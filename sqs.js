'use strict'
const AWS = require('aws-sdk');
const constants = require("./constants");

AWS.config.update({ region: "ap-northeast-2" })
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" })

// Queue에서 message를 10개 가져옵니다.
exports.fetchMessagesFromQueue =function fetchMessagesFromQueue() {
    const params = {
        QueueUrl: constants.QUEUE_URL, /* required */
        AttributeNames: ["All"],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
            'STRING_VALUE',
        ]
    }
    
    return sqs.receiveMessage(params).promise()
}


// queue에서 메세지를 제거합니다.
exports.deleteMessageFromQueue= function deleteMessageFromQueue(messages) {
    if (messages.length === 0) {
        return null
    }
    const entries = messages.map(msg => { return { Id: msg.id, ReceiptHandle: msg.receipt_handle } })
    return sqs.deleteMessageBatch({
        Entries: entries,
        QueueUrl: constants.QUEUE_URL,
    }).promise()
}