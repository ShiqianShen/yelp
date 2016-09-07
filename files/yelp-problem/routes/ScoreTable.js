var express = require('express');
var p = require('promise-resolver');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com"
});

exports.ScoreTable = function(id, Category){
    var def = p.defer();

    var tags = new Array();
    var scores = new Array();
    var r_params ={
        TableName : "Review",
        IndexName: "user_id-stars-index",
        KeyConditionExpression: "#id = :iiii",
        ExpressionAttributeNames:{
            "#id": "user_id"
        },
        ExpressionAttributeValues: {
            ":iiii": id
        }
    };
    var count =0;
    var docR = new AWS.DynamoDB.DocumentClient();
    docR.query(r_params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            data.Items.forEach(function(item) {
                //console.log(item);
                var number = data.Items.length;
                var user_stars = item.stars;
                var params ={
                    TableName : "Business",
                    IndexName: "business_id-index",
                    KeyConditionExpression: "#id = :iiii",
                    ExpressionAttributeNames:{
                        "#id": "business_id"
                    },
                    ExpressionAttributeValues: {
                        ":iiii": item.business_id
                    }
                };
                var docB = new AWS.DynamoDB.DocumentClient();
                docB.query(params, function(err, data) {
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                    } else {
                        data.Items.forEach(function(item) {
                            for (var i = 0; i < item.categories.length; i++) {
                                if (item.categories != Category){
                                    tags[tags.length]=item.categories[i];
                                    scores[scores.length]=user_stars-item.stars;
                                }
                            }
                        });
                        count+=1;
                        if (count==number){
                            def.resolve([tags,scores]);
                        }
                    }
                });
            });
        }
    });
    return def.promise;
}
