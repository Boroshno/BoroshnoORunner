import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-imageoverlay-rotated';
import * as omnivore from '@mapbox/leaflet-omnivore';
import 'leaflet-routing-machine';
import 'lrm-graphhopper';
import "leaflet.animatedmarker/src/AnimatedMarker";
import compjson from '../../competitions/competitions.json';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  private map;
  private showRepositionMarker = false;
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
    this.initMap(selectedComp);
  }

  private initMap(competitionName): void {
    const competition = compjson.competitions.find(x => x.name === competitionName);

    if (this.map !== undefined && this.map !== null) {
      this.map.remove(); // should remove the map from UI and clean the inner children of DOM element
    }

    this.map = L.map('map', {});

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var that = this;

    var i = 0;
    competition.participants.forEach(part => {
      var color = that.colors[i % that.colors.length];
      i++;
      var runLayer = omnivore.gpx("competitions/" + competitionName + "/" + part + ".gpx", null, L.geoJSON(null, { style: { color: color } }))
      .on('ready', function() {
        that.map.fitBounds(runLayer.getBounds());
  
        if (runLayer.getLayers()[0]) 
        {
          var iconclass = color + '-div-icon'
          this.animatedMarker = L.animatedMarker(runLayer.getLayers()[0].getLatLngs(), {
            icon: L.divIcon({className: iconclass})
          });
          this.animatedMarker.addTo(that.map);
          this.animatedMarker.start();
        }
      })
      .addTo(this.map);
    });

    tiles.addTo(this.map);

    const point1 = L.latLng(+competition.mapbounds.point1Lat, +competition.mapbounds.point1Long); 
    const point2 = L.latLng(+competition.mapbounds.point2Lat, +competition.mapbounds.point2Long);
    const point3 = L.latLng(+competition.mapbounds.point3Lat, +competition.mapbounds.point3Long);

    var bounds = L.latLngBounds(
      point1, 
      point2)
      .extend(point3);
		this.map.fitBounds(bounds);
    var imageOverlay = L.imageOverlay.rotated(
      "competitions/" + competitionName + "/map.jpg", 
      point1, 
      point2, 
      point3, 
      { opacity: 0.8 });

    if (this.showRepositionMarker) 
      this.addRepositionMarkers(point1, point2, point3, imageOverlay);

    this.map.addLayer(imageOverlay);
  }

  public addRepositionMarkers(point1: L.LatLng, point2: L.LatLng, point3: L.LatLng, imageOverlay: L.ImageOverlay.Rotated)
  {

      var myicon = L.icon({
        iconSize: [ 25, 41 ],
        iconAnchor: [ 12, 41 ],
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
        });

      var marker1 = L.marker(point1, {draggable: true, icon: myicon } ).addTo(this.map),
      marker2 = L.marker(point2, {draggable: true, icon: myicon } ).addTo(this.map),
      marker3 = L.marker(point3, {draggable: true, icon: myicon } ).addTo(this.map);

    function repositionImage() {
      imageOverlay.reposition(marker1.getLatLng(), marker2.getLatLng(), marker3.getLatLng());
    };
		
		marker1.on('drag dragend', repositionImage);
		marker2.on('drag dragend', repositionImage);
		marker3.on('drag dragend', repositionImage);
  }
}
