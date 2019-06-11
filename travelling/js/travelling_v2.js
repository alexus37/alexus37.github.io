require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GeoJSONLayer",
  "https://cdn.jsdelivr.net/npm/geolib@3.0.3/lib/index.min.js",
],
  function (Map, MapView, Graphic, GeoJSONLayer, geolib) {
    let map = null;
    let view = null;
    let countries = [];
    let distanceData = {
      flight: { dist: 0, times: 0 },
      train: { dist: 0, times: 0 },
      bus: { dist: 0, times: 0 },
      car: { dist: 0, times: 0 },
      motorbike: { dist: 0, times: 0 },
      walking: { dist: 0, times: 0 },
      train: { dist: 0, times: 0 },
      boat: { dist: 0, times: 0 },
      horse: { dist: 0, times: 0 },
    }

    // consts
    const COLORS = {
      flight: '#30ffea',
      train: '#45A29E',
      bus: '#9A1750',
      car: '#D79922',
      motorbike: '#F13C20',
      walking: '#FFCB9A',
      boat: '#374785',
      horse: '#86c232',
    };

    const ICONS = {
      flight: '✈️',
      train: '🚂',
      bus: '🚌',
      car: '🚗',
      motorbike: '🏍️',
      walking: '🚶‍♂',
      boat: '⛵',
      horse: '🐎',
    };


    const initMap = () => {
      map = new Map({
        basemap: "dark-gray"
      });

      view = new MapView({
        container: "viewDiv",
        map,
        zoom: 3,
        center: [55, 25] // longitude, latitude
      });
      view.ui.remove('attribution');


      // add cities as markers
      const costumGraphics = [];

      tracks.forEach((track) => {
        let symbol = {
          type: "simple-line", // autocasts as new SimpleLineSymbol()
          color: "#30ffea",
          width: "1.5px",
          style: "solid"
        };

        let geometry = {
          type: "polyline", // autocasts as new Polyline()
          paths: []
        };
        switch (track.type) {
          case 'flight': {
            const { fromLatLng, toLatLng } = track;
            geometry.paths = [fromLatLng.slice().reverse(), toLatLng.slice().reverse()];
            symbol.color = COLORS['flight'];

            distanceData[track.type].dist += geolib.getDistance(
              { latitude: fromLatLng[0], longitude: fromLatLng[1] },
              { latitude: toLatLng[0], longitude: toLatLng[1] },
            ) / 1000;
            distanceData[track.type].times += 1;

            break;
          }
          default: {
            const { coordinates } = track;
            geometry.paths = coordinates.map(c => c.slice().reverse());
            symbol.color = COLORS[track.type];
            const line = coordinates.map(([latitude, longitude]) => ({ latitude, longitude }));
            distanceData[track.type].dist += geolib.getPathLength(
              line
            ) / 1000;
            distanceData[track.type].times += 1;
            break;
          }
        }

        costumGraphics.push(new Graphic({
          geometry,
          symbol,
        }));
      });

      cities.forEach(({ country, latlng }) => {
        countries.push(country);

        const geometry = {
          type: "point", // autocasts as new Point()
          longitude: latlng[1],
          latitude: latlng[0]
        };

        const symbol = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          size: 5,
          color: [0, 255, 255],
          outline: null
        };

        costumGraphics.push(new Graphic({ geometry, symbol }));
      });

      view.graphics.addMany(costumGraphics);

      showStats([{
        key: 'Distance traveled ',
        values: Object.entries(distanceData)
          .map(([type, value]) => ({ type, ...value }))
      }]);
      initCountires();
    }

    const showStats = (data) => {


      nv.addGraph(function () {
        var chart = nv.models.discreteBarChart()
          .x(function (d) { return d.type })
          .y(function (d) { return d.dist })
          .color(function (d) {
            return COLORS[d.type];
          })
          .showValues(true);
        chart.yAxis.tickFormat(d3.format('.2s'));
        chart.xAxis.tickFormat(function (d) {
          return ICONS[d];
        });
        chart.tooltip.contentGenerator(function (d) {
          return `${d.data.times} Times ${d.data.type}`
        });


        d3.select('#travelDist svg')
          .datum(data)
          .transition().duration(500)
          .call(chart)
          ;

        nv.utils.windowResize(chart.update);

        return chart;
      });
    }

    const countBy = (arr, fn) =>
      arr.map(typeof fn === 'function' ? fn : val => val[fn]).reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});


    const initCountires = async () => {

      const citiesPerCountry = countBy(countries, c => c);
      const maxVisits = Math.max(...Object.values(citiesPerCountry));

      const viewCountries = new MapView({
        container: "countries",
        map: new Map({ basemap: "dark-gray" }),
        zoom: 1,
        center: [55, 25] // longitude, latitude
      });

      viewCountries.ui.remove('attribution');

      const worldReq = await fetch('data/countries.geo.json');
      const worldJson = await worldReq.json();
      const costumGraphics = [];

      worldJson.features.forEach(country => {

        if(Object.keys(citiesPerCountry).includes(country.properties.name)) {
          const symbol = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: [57, 200 - (200 * citiesPerCountry[country.properties.name] / maxVisits), 200, 0.8],
            outline: {
              // autocasts as new SimpleLineSymbol()
              color: [255, 255, 255],
              width: 1
            }
          };

          if (country.geometry.type === "Polygon") {
            const geometry = {
              type: "polygon", // autocasts as new Polygon()
              rings: country.geometry.coordinates
            };

            costumGraphics.push(new Graphic({ geometry, symbol }));
          } else {
            country.geometry.coordinates.forEach(rings => {
              const geometry = {
                type: "polygon", // autocasts as new Polygon()
                rings,
              };

              costumGraphics.push(new Graphic({ geometry, symbol }));
            })

          }
        }
      });

      viewCountries.graphics.addMany(costumGraphics);
    }


    initMap();

  });