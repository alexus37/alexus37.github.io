#!/bin/bash

for f in *\ *; 
do 
mv "$f" "${f// /_}"; 
done

array=(*.jpg);
for f in ${array[*]};
do 
echo $f
convert $f -resize 48x36 "${f%.*}_thumb.jpg"
done
