import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-imageoverlay-rotated';
import * as omnivore from '@mapbox/leaflet-omnivore';
import 'leaflet-routing-machine';
import 'lrm-graphhopper';
import "leaflet.animatedmarker/src/AnimatedMarker";
import compjson from '../../competitions/competitions.json';
import 'leaflet-timedimension/dist/leaflet.timedimension.src.js';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  private map;
  private showRepositionMarker = false;
  private selectedCompetition = null;
  public animatedMarker: any;
  public competitions;
  public colors;

  constructor(private cdr: ChangeDetectorRef) {
    this.colors = ['blue','red','green'];
   }

  ngAfterViewInit(): void {
    this.competitions = [];
    compjson.competitions.forEach(comp => {
      this.competitions.push(comp);
    });
    this.cdr.detectChanges();
  }

  onCompetitionChange(selectedComp) {
    this.selectedCompetition = compjson.competitions.find(x => x.name === selectedComp);

    if (this.map !== undefined && this.map !== null) {
      this.map.remove(); // should remove the map from UI and clean the inner children of DOM element
    }
    this.map = L.map('map', {});

    if (this.selectedCompetition) 
      this.initTimeDimensions();
  }

  private initTimeDimensions() {
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    this.initializeMap();

    const baseLayers = {
      OSM: tiles
    };
    const overlayMaps = {};
    
    var i = 0;
    this.selectedCompetition.participants.forEach(part => {
      var color = this.colors[i % this.colors.length];
      i++;
      const customLayer = this.initCustomLayer(color);
      const gpxLayer = this.initGpxLayer(part, customLayer);
      const gpxTimeLayer = this.initTimeLayer(gpxLayer);
      overlayMaps[this.selectedCompetition.name] = gpxTimeLayer;
      gpxTimeLayer.addTo(this.map);
    });

    tiles.addTo(this.map);

    const point1 = L.latLng(+this.selectedCompetition.mapbounds.point1Lat, +this.selectedCompetition.mapbounds.point1Long); 
    const point2 = L.latLng(+this.selectedCompetition.mapbounds.point2Lat, +this.selectedCompetition.mapbounds.point2Long);
    const point3 = L.latLng(+this.selectedCompetition.mapbounds.point3Lat, +this.selectedCompetition.mapbounds.point3Long);

    const bounds = L.latLngBounds(
      point1, 
      point2).extend(point3);
		this.map.fitBounds(bounds);
    const imageOverlay = L.imageOverlay.rotated(
      "competitions/" + this.selectedCompetition.name + "/map.jpg", 
      point1, 
      point2, 
      point3, 
      { opacity: 0.8 });

    if (this.showRepositionMarker) 
      this.addRepositionMarkers(point1, point2, point3, imageOverlay);

    this.map.addLayer(imageOverlay);
  }

  private initCustomLayer(color)
  {
    return L.geoJSON(null, { style: { color: color }, pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    } });
  }

  private initGpxLayer(participant, customLayer)
  {
    return omnivore.gpx("competitions/" + this.selectedCompetition.name + "/" + participant + ".gpx", null, customLayer);
  }

  private initTimeLayer(gpxLayer) {
    return L.timeDimension.layer.geoJson(gpxLayer, {
      updateTimeDimension: true,
      addlastPoint: true,
      waitForReady: true
    });
  }

  private initializeMap() {
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
      maxSpeed:      300,
      timeSliderDragUpdate: true
    };

    const timeDimensionControl = new L.Control.TimeDimension(timeDimensionControlOptions);
    this.map.addControl(timeDimensionControl);
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
