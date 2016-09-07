# -*- coding: utf-8 -*-
"""
Created on Thu Mar 17 15:20:06 2016

@author: shens
"""

f=open('yelp_academic_dataset_tip.json','r')
i=0
for line in f:
    i+=1
l=i
i=0
f=open('yelp_academic_dataset_tip.json','r')
for line in f:
#for i in range (0,3):
    i+=1
    if i==1:
        line = '['+line[:-1]+','
    elif i==l:
        line = line[:-1]+']'
    else:
        line = line[:-1]+','
    print (line)
