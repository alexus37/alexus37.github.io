#!/usr/bin/python

import os
import sys
import exifread

def sign(n):
    if n > 0:
        return 1
    return -1
def deg2dec(gps) :
    return sign(gps[0]) * (abs(gps[0]) + (gps[1] / 60.0) + (gps[2] / 3600.0));

def convert(tag):
    lat = str(tag)[1:-1].split(',')
    lat[0] = float(lat[0])
    lat[1] = float(lat[1])
    lastLat = lat[2].split('/')
    if "/" in lat[2]:
        lat[2] = float(lastLat[0]) / float(lastLat[1])
    lat[2] = float(lat[2])
    return lat

def getLatLng(path):
    f = open(path, 'rb')
    tags = exifread.process_file(f)
    latlng = []
    if 'GPS GPSLatitude' in tags.keys():
        lat = convert(tags['GPS GPSLatitude'])
        lat = deg2dec(lat)
        latlng.append(lat)

        lng = convert(tags['GPS GPSLongitude'])
        lng = deg2dec(lng)
        latlng.append(lng)
    



    return latlng
def getExifData(city, target, lastflag):
    path = './' + city
    images  = filter(lambda x: '_thumb' not in x and '.jpg' in x, os.listdir(path))
    
    for i in range(len(images)):
        ll = getLatLng(path + '/' + images[i])
        if len(ll) > 0:
            target.write("\"" + images[i] + "\": [" + str(ll[0]) + ", " + str(ll[1]) + "]")
            if not (lastflag and (i + 1 == len(images))):
                target.write(",\n")
        



def createFile():
    target = open('../data/latlng.js', 'w')
    target.truncate()
    target.write("var latlngDic = {\n")
    return target



if __name__ == "__main__":
    target = createFile()
    avoid = ["APSS", "graphs", "medium", "orig", "results"]
    subdirectories = filter(lambda x: os.path.isdir(os.path.join('.', x)) and x not in avoid, os.listdir('.'))

    for i in range(len(subdirectories)):
        getExifData(subdirectories[i], target, i + 1 == len(subdirectories))
        


    target.write("\n};\n")
    target.close()
