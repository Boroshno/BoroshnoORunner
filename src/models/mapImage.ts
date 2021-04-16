import * as L from 'leaflet';

export class mapImage {

    constructor() {  //We have mocked value here for the first version of the product
        // this.imageUrl = 'assets/IMG_7122.JPG';
        // this.gpxFile = 'assets/4906407462.gpx';
        // this.point1 = L.latLng(49.833415317378744, 36.72540664672852);
        // this.point2 = L.latLng(49.83175443381274, 36.744589805603034);
        // this.point3 = L.latLng(49.813951717165345, 36.720857620239265);
        this.imageUrl = 'assets/ObolonaRun/map.jpg';
        this.gpxFile = 'assets/ObolonaRun/5108398399.gpx';
        this.point1 = L.latLng(49.79218086595708, 36.0917615890503);
        this.point2 = L.latLng(49.79057397761196, 36.12115859985352);
        this.point3 = L.latLng(49.76602074512579, 36.08802795410157);
    }

    imageUrl;
    gpxFile;
    point1;
    point2;
    point3;
}