var express = require('express');
var Q = require('./DataQuery.js');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com"
});

exports.Push = function(id, value){

    var list = eval(JSON.stringify(value));

    for (var i = 0; i < value.length && i< 200 ; i++){
        var params ={
            TableName : "UserInfo",
            KeyConditionExpression: "#id = :iiii",
            ExpressionAttributeNames:{
                "#id": "user_id"
            },
            ExpressionAttributeValues: {
                ":iiii": list[i].user_id
            }
        };
        //console.log(list[i].user_id);
        var User = Q.DataQuery(params);
        User.then(function(value){
            var push = eval(JSON.stringify(value))[0].push;
            push[push.length] = id;
            //console.log(push);
            var up_params = {
                TableName:'UserInfo',
                Key:{
                    "user_id": eval(JSON.stringify(value))[0].user_id
                },
                UpdateExpression: "set push = :p",
                ExpressionAttributeValues:{
                    ":p":push
                },
                ReturnValues:"UPDATED_NEW"
            };
            var docClient = new AWS.DynamoDB.DocumentClient();
            docClient.update(up_params, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                }
            });
        });
    }
}
