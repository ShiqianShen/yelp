from __future__ import print_function # Python 2/3 compatibility
import boto3
import json
import decimal

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="https://dynamodb.us-west-2.amazonaws.com")

table = dynamodb.Table('Business')

with open("business.json") as json_file:
    businesses = json.load(json_file, parse_float = decimal.Decimal)
    for business in businesses:
	typename = business['type']
        business_id = business['business_id']
        name = business['name']
        neighborhoods = business['neighborhoods']
        full_address = business['full_address']
        city = business['city']
        state = business['state']
        latitude = business['latitude']
        longitude = business['longitude']
        stars = business['stars']
        review_count = business['review_count']
        categories = business['categories']
        open_close = business['open']
        hours = business['hours']
        attributes = business['attributes']

        print("Adding business:", business_id)

	if typename=='':
		typename = 'business'
	if full_address=='':
		full_address = 'unknown'
	if city=='':
		city = 'unknown'
	if state=='':
		state = 'unknown'

        table.put_item(
           Item={
	       'type': typename,
               'business_id': business_id,
               'name': name,
               'neighborhoods': neighborhoods,
	       'full_address': full_address,
	       'city': city,
	       'state': state,
	       'latitude': latitude,
	       'longitude': longitude,
	       'stars': stars,
	       'review_count': review_count,
	       'categories': categories,
	       'open': open_close,
	       'hours': hours,
	       'attributes': attributes,
            }
        )
