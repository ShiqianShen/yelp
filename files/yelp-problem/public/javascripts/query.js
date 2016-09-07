var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "https://dynamodb.us-west-2.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient();

//console.log("Querying for movies from 1985.");

var params = {
  TableName : "Business",
  IndexName: "city-stars-index",
  KeyConditionExpression: "#c = :cccc",
  ExpressionAttributeNames:{
    "#c": "city"
  },
  ExpressionAttributeValues: {
    ":cccc":"Lasswade"
  }
};

docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        //console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log(" -", item.city + "	" + item.name);
        });
    }
});
