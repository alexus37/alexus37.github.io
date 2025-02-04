#!/bin/bash

if [[ "${#}" -ne "1" ]]
then
    echo "Usage: $0 <city> "
    exit 1
fi

city="${1}"

for f in $city"/"*\ *; 
do 
mv "$f" "${f// /_}"; 
done

array=($city"/"*.jpg);
for f in ${array[*]};
do 
echo "\"images/$f\","
convert $f -resize 48x36 "${f%.*}_thumb.jpg"
done

array=($city"/"*.JPG);
for f in ${array[*]};
do 
echo "\"images/$f\","
convert $f -resize 48x36 "${f%.*}_thumb.JPG"

done
