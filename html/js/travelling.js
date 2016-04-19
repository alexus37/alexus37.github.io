var currentImages = [];

function removeImages() {
    for (var i = 0; i < currentImages.length; i++) {
        myGlobalMap.removeLayer(currentImages[i]);
    }
};

function deg2dec(gps) {
    var d = gps[0].numerator / gps[0].denominator;
    var m = gps[1].numerator / gps[1].denominator;
    var s = gps[2].numerator / gps[2].denominator;

    return Math.sign(d) * (Math.abs(d) + (m / 60.0) + (s / 3600.0));
};

function addImages(path) {
    var http = new XMLHttpRequest();
        http.open("GET", path, true);
        http.responseType = "blob";
        http.onload = function(e) {
            if (this.status === 200) {
                var image = new Image();

                image.onload = function() {
                    EXIF.getData(image, function() {
                        var latlng = [deg2dec(this.exifdata.GPSLatitude), deg2dec(this.exifdata.GPSLongitude)];
                        
                        var previewIcon = L.icon({
                            iconUrl: path.slice(0, -4) + '_thumb.jpg',
                            iconSize:     [48, 36] // size of the icon                    
                        });

                        var marker = L.marker(latlng, {icon: previewIcon});
                        marker.orig = path;
                        marker.on('click', function(event) {
                            $.fancybox({
                                href: event.target.orig,                                
                                preload: true
                            });
                            
                        });
                        marker.addTo(myGlobalMap);

                        // add to current images
                        currentImages.push(marker);                        
                        
                    });
                };
                image.src = URL.createObjectURL(http.response);
            }
        };
        http.send();  
};

function loadImages(city) {
    // remove the current Images
    removeImages();

    //load the new images
    for (var i = 0; i < city.images.length; i++) {
        addImages(city.images[i]);
    }
};

function addCities(cities) {
    for (var i = 0; i < cities.length; i++) {
        var marker = L.marker(cities[i].latlng)
        marker.city = cities[i];
        marker.addTo(myGlobalMap);

        marker.on({
                "mouseover": function(event) {
                    info.update(event.target.city, "city");
                },
                "mouseout": function(event) {
                    info.update();
                },
                "click": function(event) {
                    myGlobalMap.setView(event.target.city.latlng, 10);
                    loadImages(event.target.city);
                }
            });
    }
}
function addTracks(tracks) {
    for (var i = 0; i < tracks.length; i++) {
        var line;
        var color = 'red';
        if(tracks[i].type === 'flight') {
            color = 'blue';
            line = L.Polyline.Arc(tracks[i].fromLatLng, tracks[i].toLatLng, {
                color: color,
                vertices: 200
            })

        } else {
            if(tracks[i].type === 'bus') {
                color = 'green';
            }
            
            line = L.polyline(tracks[i].coordinates,
                {   
                    color: color,
                    weight: 4,
                    opacity: .7,
                    dashArray: '10.2',
                    lineJoin: 'round'
                }
            );
        }
        line.addTo(myGlobalMap);
        line.track = tracks[i];
        line.on({
            "mouseover": function(event) {
                info.update(event.target.track, "track");
            },
            "mouseout": function(event) {
                info.update();
            }
        });
    }
}

// init map and titles
var myGlobalMap = L.map('globalMap').setView([22.065278, 78.398438], 4);
myGlobalMap.addLayer(new L.Google('ROADMAP'));

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props, updateType) {
    if(updateType === 'city') {        
        this._div.innerHTML = '<h4>Place </h4><b>' + props.name + '</b><br />' + props.country;
    } else if(updateType === 'track') {
        this._div.innerHTML = '<h4>' + props.type  + '</h4>from: <b>' + props.from + '</b><br />to: <b>' + props.to + '</b>';
    } else {
        this._div.innerHTML = 'Hover over a marker or a polyline';
    }

};

info.addTo(myGlobalMap);

// add cities
addCities(cities);

// add Path TODO
addTracks(tracks);
