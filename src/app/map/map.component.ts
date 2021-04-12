import { Component, OnInit, AfterViewInit } from '@angular/core';
import { mapImage } from '../../models/mapImage';
import * as L from 'leaflet';
import 'leaflet-imageoverlay-rotated';
import * as omnivore from '@mapbox/leaflet-omnivore';
import 'leaflet-routing-machine';
import 'lrm-graphhopper';
//import 'leaflet.animatedmarker';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  private map;
  private showRepositionMarker = true; 
  public mapImg : mapImage;

  constructor() {
    this.mapImg = new mapImage();
   }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {

    this.map = L.map('map', {});

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    var that = this;

    var runLayer = omnivore.gpx('assets/4906407462.gpx')
    .on('ready', function() {
      that.map.fitBounds(runLayer.getBounds());
    })
    .addTo(this.map);

    tiles.addTo(this.map);

    var bounds = L.latLngBounds(this.mapImg.point1, this.mapImg.point2).extend(this.mapImg.point3);
		this.map.fitBounds(bounds);
    var imageOverlay = L.imageOverlay.rotated(this.mapImg.imageUrl, this.mapImg.point1, this.mapImg.point2, this.mapImg.point3, { opacity: 0.8 });

    if (this.showRepositionMarker) this.addRepositionMarkers(this.mapImg.point1, this.mapImg.point2, this.mapImg.point3, imageOverlay);

    this.map.addLayer(imageOverlay);
    
    //var animatedMarker = L.animatedMarker(runLayer._layers[70].getLatLngs());
    //animatedMarker.start();
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
