import * as L from 'leaflet';

declare module 'leaflet' {
  const geoJson: any;
  const TimeDimension: any;
  const timeDimension: any;

  export namespace Control {
    class TimeDimension {
      constructor(timeDimensionControlOptions: any)
    }
  }
}

