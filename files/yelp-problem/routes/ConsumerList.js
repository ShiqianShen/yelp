var express = require('express');
var p = require('promise-resolver');
var Q = require('./DataQuery.js');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com"
});

exports.ConsumerList = function(id){
    var params ={
        TableName : "Business",
        IndexName: "business_id-index",
        KeyConditionExpression: "#id = :iiii",
        ExpressionAttributeNames:{
            "#id": "business_id"
        },
        ExpressionAttributeValues: {
            ":iiii": id
        }
    };
    var Business = Q.DataQuery(params);

    var def = p.defer();
    Business.then(function(value) {
        //console.log(Business);
        //console.log((eval(JSON.stringify(value))[0].categories)[0]);
        var params ={
            TableName : "Business",
            IndexName: "city-stars-index",
            KeyConditionExpression: "#ct = :cccc",
            FilterExpression: "contains(categories, :letter)",
            ScanIndexForward: false,
            ExpressionAttributeNames:{
                "#ct": "city"
            },
            ExpressionAttributeValues: {
                ":cccc": eval(JSON.stringify(value))[0].city,
                ":letter": (eval(JSON.stringify(value))[0].categories)[0]
            }
        };
        var Nearby = Q.DataQuery(params);
        Nearby.then(function(value) {
            var ConsumerList = new Array();
            var number = value.length;
            var count = 0;
            for (var i = 0; i < value.length; i++){
                var params ={
                    TableName : "Review",
                    KeyConditionExpression: "#id = :iiii",
                    ExpressionAttributeNames:{
                        "#id": "business_id"
                    },
                    ExpressionAttributeValues: {
                        ":iiii": eval(JSON.stringify(value))[i].business_id
                    }
                };
                var avg_stars = eval(JSON.stringify(value))[i].stars;
                var docClient = new AWS.DynamoDB.DocumentClient();
                docClient.query(params, function(err, data) {
                    count+=1;
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                    } else {
                        data.Items.forEach(function(item) {
                            ConsumerList[ConsumerList.length] = [item.user_id, 0.3+item.stars-avg_stars];
                        });
                    }
                    //console.log(count);
                    if (count==number){
                        def.resolve(ConsumerList);
                        //console.log(ConsumerList.length, ConsumerList[1000]);
                    }
                    //console.log(Result);
                });
            }
        });
    });
    return def.promise;
}