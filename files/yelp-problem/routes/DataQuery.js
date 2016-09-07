var express = require('express');
var p = require('promise-resolver');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2",
    endpoint: "https://dynamodb.us-west-2.amazonaws.com"
});

exports.DataQuery = function(params){
    var def = p.defer();
    var Result = new Array();
    var count =0;
    var docClient = new AWS.DynamoDB.DocumentClient();
    docClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            data.Items.forEach(function(item) {
                //Result[count] = " -" + item.city + "	" + item.name;
                //console.log(item);
                Result[count] = item;
                count+=1;

            });
        }
        def.resolve(Result);
        //console.log(Result);
    });
    return def.promise;
}
