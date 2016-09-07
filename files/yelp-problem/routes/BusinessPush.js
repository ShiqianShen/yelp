var express = require('express');
var p = require('promise-resolver');
var Q = require('./DataQuery.js');
var C = require('./ConsumerList.js');

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

exports.BusinessPush = function(id){

    var def = p.defer();

    var ConsumerList = C.ConsumerList(id);
    ConsumerList.then(function(value){
        //console.log(value.length);
        value = value.sort();
        //console.log(value);

        var number = 0;
        for (var i = 1; i < value.length; i++){
            if (value[i][0]!=value[number][0]){
                number+=1;
                value[number]=value[i];
            }else{
                value[number][1]+=value[i][1];
            }
        }
        number+=1;
        //console.log(number,value.length,NewList.length, value);
        var PushList = new Array();
        //var number = NewList.length;
        var count = 0;
        for (var i = 0; i < number; i++){
            var params ={
                TableName : "UserInfo",
                KeyConditionExpression: "#id = :iiii",
                ExpressionAttributeNames:{
                    "#id": "user_id"
                },
                ExpressionAttributeValues: {
                    ":iiii": value[i][0]
                }
            };
            var docClient = new AWS.DynamoDB.DocumentClient();
            docClient.query(params, function(err, data) {
                if (err) {
                    console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                } else {
                    data.Items.forEach(function (item) {
                        //console.log(NewList[i]);
                        var score = value[i][1];
                        score += 0.02*item.friends.length + 0.5*item.elite.length + 0.3*item.fans + item.average_stars;
                        item.score = score;
                        PushList[PushList.length] = item;
                        count+=1;
                        //console.log(score);
                    });
                }
                if (count == number) {
                    PushList.sort(sortBy('score', true, parseFloat));
                    def.resolve(PushList);
                    //console.log(PushList[0],PushList[2000]);
                }
            });
        }
    });
    return def.promise;
}


