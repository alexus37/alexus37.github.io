#!/usr/bin/python

import requests
import sys
import json

def decode_polyline(polyline_str):
    index, lat, lng = 0, 0, 0
    coordinates = []
    changes = {'latitude': 0, 'longitude': 0}

    # Coordinates have variable length when encoded, so just keep
    # track of whether we've hit the end of the string. In each
    # while loop iteration, a single coordinate is decoded.
    while index < len(polyline_str):
        # Gather lat/lon changes, store them in a dictionary to apply them later
        for unit in ['latitude', 'longitude']: 
            shift, result = 0, 0

            while True:
                byte = ord(polyline_str[index]) - 63
                index+=1
                result |= (byte & 0x1f) << shift
                shift += 5
                if not byte >= 0x20:
                    break

            if (result & 1):
                changes[unit] = ~(result >> 1)
            else:
                changes[unit] = (result >> 1)

        lat += changes['latitude']
        lng += changes['longitude']

        coordinates.append([lat / 100000.0, lng / 100000.0])

    return coordinates


def requestData(origin, destination, mode = 'driving'):
    url = 'https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination + '&mode=' + mode
    print('Requesting...\n' + url)
    r = requests.get(url)

    j = json.loads(r.text)
    if (j['status'] == 'ZERO_RESULTS'):
        print('No routes found!')
        return  
    else:
        coordinates = decode_polyline(j['routes'][0]['overview_polyline']['points'])
        print(coordinates)




if __name__ == "__main__":
    if(len(sys.argv) < 3):
       print("usage getPolyPoints.py <origin> <destination> [mode]")
    elif(len(sys.argv) == 3):
        requestData(sys.argv[1], sys.argv[2])
    else:
        requestData(sys.argv[1], sys.argv[2], sys.argv[3])

