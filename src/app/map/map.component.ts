import { Component, OnInit, AfterViewInit } from '@angular/core';
import { mapImage } from '../../models/mapImage';
import * as L from 'leaflet';
import 'leaflet-imageoverlay-rotated';
import * as omnivore from '@mapbox/leaflet-omnivore';
import 'leaflet-routing-machine';
import 'lrm-graphhopper';
import 'leaflet-timedimension/dist/leaflet.timedimension.src.js';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  private map;
  private showRepositionMarker = true;
  public mapImg: mapImage;

  constructor() {
    this.mapImg = new mapImage();
   }

  ngAfterViewInit(): void {
    this.initTimeDimensions();
  }

  private initTimeDimensions() {
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    this.initializeMap(tiles);

    const runners = [
      {
        name: 'Dimon',
        markerClassName: 'blue-div-icon',
        gpxFile: this.mapImg.gpxFile
      },
      {
        name: 'Sanya',
        markerClassName: 'red-div-icon',
        gpxFile: 'assets/ObolonaRun/5111036665.gpx'
      }
    ];

    const baseLayers = {
      OSM: tiles
    };
    const overlayMaps = {};

    runners.forEach(({name, markerClassName, gpxFile}) => {
      const customLayer = this.getCustomLayer(markerClassName);
      const gpxLayer = this.initGpxLayer(gpxFile, customLayer);
      const gpxTimeLayer = this.initTimeLayer(gpxLayer);
      overlayMaps[name] = gpxTimeLayer;
      gpxTimeLayer.addTo(this.map);
    });

    L.control.layers(baseLayers, overlayMaps).addTo(this.map);
  }

  private initTimeLayer(gpxLayer) {
    return L.timeDimension.layer.geoJson(gpxLayer, {
      updateTimeDimension: true,
      addlastPoint: true,
      waitForReady: true
    });
  }

  private getCustomLayer(className) {
    const icon = L.divIcon({className});

    const customLayer = L.geoJson(null, {
      pointToLayer: (feature, latLng) => {
        if (feature.properties.hasOwnProperty('last')) {
          return new L.Marker(latLng, {
            icon
          });
        }
        return L.circleMarker(latLng);
      },
      style: className === 'red-div-icon' ? { color: '#ff0000' } : { color: '#0000ff' }
    });

    return customLayer;
  }

  private initGpxLayer(gpxFile, customLayer) {
    const runLayer = omnivore.gpx(gpxFile, null, customLayer)
      .on('ready', () => {
        this.map.fitBounds(runLayer.getBounds());
      });
    return runLayer;
  }

  private initializeMap(tiles) {
    this.map = L.map('map', {});

    // start of TimeDimension manual instantiation
    const timeDimension = new L.TimeDimension({
      period: 'PT1S'
    });
    // helper to share the timeDimension object between all layers
    this.map.timeDimension = timeDimension;
    // otherwise you have to set the 'timeDimension' option on all layers.

    const player        = new L.TimeDimension.Player({
      transitionTime: 100,
      loop: false,
      startOver: true
    }, timeDimension);

    const timeDimensionControlOptions = {
      player,
      timeDimension,
      position:      'bottomleft',
      autoPlay:      true,
      minSpeed:      1,
      speedStep:     0.5,
      maxSpeed:      15,
      timeSliderDragUpdate: true
    };

    const timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
    this.map.addControl(timeDimensionControl);

    tiles.addTo(this.map);

    const bounds = L.latLngBounds(this.mapImg.point1, this.mapImg.point2).extend(this.mapImg.point3);
    this.map.fitBounds(bounds);
    const imageOverlay = L.imageOverlay.rotated(
      this.mapImg.imageUrl,
      this.mapImg.point1,
      this.mapImg.point2,
      this.mapImg.point3,
      { opacity: 0.8 }
    );

    if (this.showRepositionMarker) {
      this.addRepositionMarkers(this.mapImg.point1, this.mapImg.point2, this.mapImg.point3, imageOverlay);
    }

    this.map.addLayer(imageOverlay);
  }

  public addRepositionMarkers(point1: L.LatLng, point2: L.LatLng, point3: L.LatLng, imageOverlay: L.ImageOverlay.Rotated) {
      const myicon = L.icon({
        iconSize: [ 25, 41 ],
        iconAnchor: [ 12, 41 ],
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
        });

      const marker1 = L.marker(point1, {draggable: true, icon: myicon } ).addTo(this.map);
      const marker2 = L.marker(point2, {draggable: true, icon: myicon } ).addTo(this.map);
      const marker3 = L.marker(point3, {draggable: true, icon: myicon } ).addTo(this.map);

      function repositionImage() {
        imageOverlay.reposition(marker1.getLatLng(), marker2.getLatLng(), marker3.getLatLng());
      }

      marker1.on('drag dragend', repositionImage);
      marker2.on('drag dragend', repositionImage);
      marker3.on('drag dragend', repositionImage);
  }
}
