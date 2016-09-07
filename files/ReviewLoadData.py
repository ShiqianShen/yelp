from __future__ import print_function # Python 2/3 compatibility
import boto3
import json
import decimal

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="https://dynamodb.us-west-2.amazonaws.com")

table = dynamodb.Table('Review')

with open("review.json") as json_file:
    reviews = json.load(json_file, parse_float = decimal.Decimal)
    for review in reviews:
	typename = review['type']
        business_id = review['business_id']
        user_id = review['user_id']
        stars = review['stars']
        text = review['text']
        date = review['date']
        votes = review['votes']

        print("Adding review:", business_id)

	if typename=='':
		typename = 'review'
	if text=='':
		text = ' '

        table.put_item(
           Item={
	       'type': typename,
               'business_id': business_id,
               'user_id': user_id,
               'stars': stars,
	       'text': text,
	       'date': date,
	       'votes': votes,
            }
        )
