import * as L from 'leaflet';

export class mapImage {

    constructor() {  //We have mocked value here for the first version of the product
        this.imageUrl = 'assets/IMG_7122.JPG';
        this.point1 = L.latLng(49.833415317378744, 36.72540664672852);
        this.point2 = L.latLng(49.83175443381274, 36.744589805603034);
        this.point3 = L.latLng(49.813951717165345, 36.720857620239265);
    }

    imageUrl;
    point1;
    point2;
    point3;
}