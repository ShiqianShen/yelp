var express = require('express');
var p = require('promise-resolver');
var Q = require('./DataQuery.js');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com"
});

exports.PushView = function(id){

    var Result = new Array();
    var def = p.defer();

    var params ={
        TableName : "UserInfo",
        KeyConditionExpression: "#id = :iiii",
        ExpressionAttributeNames:{
            "#id": "user_id"
        },
        ExpressionAttributeValues: {
            ":iiii": id
        }
    };
    var User = Q.DataQuery(params);
    User.then(function(value){
        var push = eval(JSON.stringify(value))[0].push;
        var count=0;
        for (var i = 0; i < push.length; i++){
            var params ={
                TableName : "Business",
                IndexName: "business_id-index",
                KeyConditionExpression: "#id = :iiii",
                ExpressionAttributeNames:{
                    "#id": "business_id"
                },
                ExpressionAttributeValues: {
                    ":iiii": push[i]
                }
            };
            var docClient = new AWS.DynamoDB.DocumentClient();
            docClient.query(params, function(err, data) {
                if (err) {
                    console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                } else {
                    data.Items.forEach(function(item) {
                        Result[Result.length] = item;
                        count+=1;
                    });
                }
                if (count == push.length){
                    //console.log(Result);
                    def.resolve(Result);
                }
            });
        }
    });
    return def.promise;
}