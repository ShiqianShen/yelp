var express = require('express');
var p = require('promise-resolver');
var Q = require('./DataQuery.js');
var S = require('./ScoreTable.js');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com"
});

var sortBy = function (filed, rev, primer) {
    rev = (rev) ? -1 : 1;
    return function (a, b) {
        a = a[filed];
        b = b[filed];
        if (typeof (primer) != 'undefined') {
            a = primer(a);
            b = primer(b);
        }
        if (a < b) { return rev * -1; }
        if (a > b) { return rev * 1; }
        return 1;
    }
};

exports.UserPush = function(id, Location, Category, Method){
    if (Method=="city"){
        if (Category){
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
                    ":cccc": Location,
                    ":letter": Category
                }
            };
        }else{
            var params ={
                TableName : "Business",
                IndexName: "city-stars-index",
                KeyConditionExpression: "#ct = :cccc",
                ScanIndexForward: false,
                ExpressionAttributeNames:{
                    "#ct": "city"
                },
                ExpressionAttributeValues: {
                    ":cccc": Location
                }
            };
        }
    }else if (Method=="cood") {
        console.log(Location);
        if (Category){
            var params ={
                TableName : "Business",
                IndexName: "type-longitude-index",
                KeyConditionExpression: "#tp = :tttt and longitude between :number1 and :number2",
                FilterExpression: "contains(categories, :letter) and latitude between :number3 and :number4",
                ScanIndexForward: false,
                ExpressionAttributeNames:{
                    "#tp": "type"
                },
                ExpressionAttributeValues: {
                    ":tttt": "business",
                    ":number1": Location[0]-2,
                    ":number2": Location[0]+2,
                    ":number3": Location[1]-2,
                    ":number4": Location[1]+2,
                    ":letter": Category
                }
            };
        }else{
            var params ={
                TableName : "Business",
                IndexName: "type-longitude-index",
                KeyConditionExpression: "#tp = :tttt and longitude between :number1 and :number2",
                FilterExpression: "latitude between :number3 and :number4",
                ScanIndexForward: false,
                ExpressionAttributeNames:{
                    "#tp": "type"
                },
                ExpressionAttributeValues: {
                    ":tttt": "business",
                    ":number1": Location[0]-2,
                    ":number2": Location[0]+2,
                    ":number3": Location[1]-2,
                    ":number4": Location[1]+2
                }
            };
        }
    }

    var def = p.defer();
    var table = S.ScoreTable(id, Category);
    table.then(function(value) {
        //console.log(value);

        var Result = new Array();
        var count =0;
        var docClient = new AWS.DynamoDB.DocumentClient();
        docClient.query(params, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            } else {
                data.Items.forEach(function(item) {

                    var score = item.stars;
                    for (var i = 0; i < item.categories.length; i++) {
                        for (var j = 0; j < value[0].length; j++) {
                            if (item.categories[i]==value[0][j]){
                                score += 0.3+ value[1][j]*0.2;
                            }
                        }
                    }
                    item.score = score;
                    Result[count] = item;
                    count += 1;
                });
            }
            Result.sort(sortBy('score', true, parseFloat));
            def.resolve(Result);
            //console.log(Result);
        });
    });
    return def.promise;
}


