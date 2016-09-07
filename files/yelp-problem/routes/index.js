var express = require('express');
var p = require('promise-resolver');
var session = require('client-sessions');
var router = express.Router();

var AWS = require("aws-sdk");
var Q = require('./DataQuery.js');
var P = require('./Push.js');
var UP = require('./UserPush.js');
var BP = require('./BusinessPush.js');
var PV = require('./PushView.js');

var push_def = p.defer();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Yelp', contents: Result });
  res.redirect('/login');
});

/* Login page. */
router.route('/login')
    .get(function(req, res, next) {
      res.render('login', { title: 'Login' });
    })
    .post(function(req, res) {
      req.session.id = req.body.id;
      if (req.body.user=='on'){
        req.session.type='user';
        res.redirect('/home');
      }else if (req.body.business=='on'){
        req.session.type='business';
        res.redirect('/home');
      }else {
        res.redirect('/login');
      }
      //console.log(req.body.user);
    });
router.get('/logout', function(req, res, next) {
  res.redirect('/login');
});

/* Home page. */
router.route('/home')
    .get(function(req, res, next) {
      //console.log(req.session.id);
      var id = req.session.id;
      if (req.session.type == 'user'){
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
        res.render('user_home_before', { title: 'Home', user: User });
      }else if (req.session.type == 'business'){
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
        res.render('business_home_before', { title: 'Home', business: Business });
      }
    })
    .post(function(req, res) {
      var id = req.session.id;
      if (req.session.type == 'user'){
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

        var Location = req.body.Location;
        var Category = req.body.Category;
        //console.log(Category);
        var Content = UP.UserPush(id, Location, Category);
        res.render('user_home_after', { title: 'Home', user: User, contents: Content});
        //res.redirect('/home');
      }else if (req.session.type == 'business') {
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
        var Content = BP.BusinessPush(id);
        Content.then(function(value){
          push_def.resolve(value);
        });
        res.render('business_home_after', { title: 'Home', business: Business, contents: Content});
      }
    });

/* Push page. */
router.get('/push', function(req, res, next) {
  var id = req.session.id;
  var push = push_def.promise;
  push.then(function(value){
    //console.log(value.length);
    P.Push(id, value);
    res.render('push', { title: 'Push Success !' });
  });
});

/* Push View page. */
router.get('/push_view', function(req, res, next) {
  var id = req.session.id;
  var Content = PV.PushView(id);
  res.render('push_view', { title: 'Push Views', contents: Content });
});

module.exports = router;