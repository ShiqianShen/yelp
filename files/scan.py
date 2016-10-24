from __future__ import print_function # Python 2/3 compatibility
import boto3
import json
import decimal
from boto3.dynamodb.conditions import Key, Attr

# Helper class to convert a DynamoDB item to JSON.

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="https://dynamodb.us-west-2.amazonaws.com")

table = dynamodb.Table('Business')

fe = Key('type').eq("business");
pe = "#ty,city,categories,stars"
ean = { "#ty": "type" }
esk = None

city = {}
category = {}
stars = {}
response = table.scan(
    ProjectionExpression=pe,
    FilterExpression=fe,
    ExpressionAttributeNames= ean,
)
for i in response['Items']:
    #if "Health & Medical" not in i['categories']:
    #    continue
    if i['city'] in city:
        city[i['city']]+=1
    else:
        city[i['city']]=1

    if i['stars'] in stars:
        stars[i['stars']]+=1
    else:
        stars[i['stars']]=1

    for j in i['categories']:
        if j in category:
            category[j]+=1
        else:
            category[j]=1

while response.get('LastEvaluatedKey'):
    response = table.scan(
        ProjectionExpression=pe,
        FilterExpression=fe,
        ExpressionAttributeNames= ean,
        ExclusiveStartKey=response['LastEvaluatedKey']
        )
    for i in response['Items']:
        #if "Health & Medical" not in i['categories']:
        #    continue
        if i['city'] in city:
            city[i['city']]+=1
        else:
            city[i['city']]=1

        if i['stars'] in stars:
            stars[i['stars']]+=1
        else:
            stars[i['stars']]=1      

        for j in i['categories']:
            if j in category:
                category[j]+=1
            else:
                category[j]=1

city = sorted(city.items(), lambda x, y: cmp(x[1], y[1]), reverse=True)
category = sorted(category.items(), lambda x, y: cmp(x[1], y[1]), reverse=True)
stars = sorted(stars.items(), lambda x, y: cmp(x[0], y[0]), reverse=True)
print(city)
print("\n\n")
print(category)
print("\n\n")
print(stars)
