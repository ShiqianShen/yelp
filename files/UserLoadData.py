from __future__ import print_function # Python 2/3 compatibility
import boto3
import json
import decimal

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="https://dynamodb.us-west-2.amazonaws.com")

table = dynamodb.Table('UserInfo')

with open("user.json") as json_file:
    users = json.load(json_file, parse_float = decimal.Decimal)
    for user in users:
	typename = user['type']
	push = user['push']
        user_id = user['user_id']
        name = user['name']
        review_count = user['review_count']
        average_stars = user['average_stars']
        votes = user['votes']
        friends = user['friends']
        elite = user['elite']
        yelping_since = user['yelping_since']
        compliments = user['compliments']
        fans = user['fans']

        print("Adding user:", user_id)

	if typename=='':
		typename = 'user'
	if compliments=='':
		compliments = 'unknown'

        table.put_item(
           Item={
	       'type': typename,
	       'push': push,
               'user_id': user_id,
               'name': name,
               'review_count': review_count,
	       'average_stars': average_stars,
	       'votes': votes,
	       'friends': friends,
	       'elite': elite,
	       'yelping_since': yelping_since,
	       'compliments': compliments,
	       'fans': fans,
            }
        )
