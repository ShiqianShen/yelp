from __future__ import print_function # Python 2/3 compatibility
import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="https://dynamodb.us-west-2.amazonaws.com")


table = dynamodb.create_table(
    TableName='Business',
    KeySchema=[
        {
            'AttributeName': 'type',
            'KeyType': 'HASH'  #Partition key
        },
        {
            'AttributeName': 'business_id',
            'KeyType': 'RANGE'  #Sort key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'type',
            'AttributeType': 'S'
        },
        {
            'AttributeName': 'business_id',
            'AttributeType': 'S'
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

print("Table status:", table.table_status)
