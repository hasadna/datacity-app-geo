import { Component, EventEmitter, Output, NgZone } from '@angular/core';
import { tileLayer, latLng, LatLngBounds, marker, icon, Map, geoJSON, MarkerOptions } from 'leaflet';
import { distinctUntilChanged, debounceTime, switchMap } from 'rxjs/operators';
import { Subject, from } from 'rxjs';
import { ApiService } from '../api.service';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent {

  @Output() selected = new EventEmitter<any>();

  options = {
    layers: [
    ],
    zoom: 7,
    center: latLng(32.0628337, 34.7709175)
  };
  layers = [];

  ready = false;
  configuration = null;
  results = new Subject<any[]>();
  bounds = new Subject<LatLngBounds>();
  query: string = null;
  map: Map;

  constructor(private api: ApiService,
              private content: ContentService,
              private zone: NgZone) {
    content.configuration.subscribe((configuration) => {
      if (configuration) {
        console.log('CONF', configuration);
        this.ready = false;
        this.query = configuration.query;
        this.options.center = configuration.center || this.options.center;
        this.options.zoom = configuration.zoom || this.options.zoom;
        this.options.layers = [];
        if (configuration.layer) {
          this.options.layers.push(geoJSON(configuration.layer, {filter: configuration.layerFilter}));
        }
        this.options.layers.push(
          tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
        );
        this.configuration = configuration;

        window.setTimeout(() => { this.ready = true; }, 0);
      }
    });

    this.bounds
      .pipe(
        distinctUntilChanged((x, y) => x.equals(y)),
        debounceTime(500),
        switchMap((bounds: LatLngBounds) => {
          console.log('bounds:', bounds);
          let query = this.query;
          if (!query) {
            return from([]);
          }
          if (!this.query.includes(' where ')) {
            query += ' where ';
          } else {
            query += ' and ';
          }
          query += `
          "location-lat" > ${bounds.getSouth()} and
          "location-lat" < ${bounds.getNorth()} and
          "location-lon" > ${bounds.getWest()} and
          "location-lon" < ${bounds.getEast()}
          ORDER BY random()`;
          return this.api.performQuery(query);
        })
      ).subscribe((rows) => {
        this.results.next(rows);
      });

    this.results.subscribe((rows) => {
      this.layers = [];
      for (const row of rows) {
        const lat = row['location-lat'];
        const lon = row['location-lon'];
        if (lat && lon) {
          const coords = latLng(row['location-lat'], row['location-lon']);
          const options: MarkerOptions = {
            title: this.configuration.title ? this.configuration.title(row) : row.title,
            riseOnHover: true,
            interactive: true,
            icon: icon({
              iconSize: [ 25, 41 ],
              iconAnchor: [ 13, 41 ],
              iconUrl: 'assets/marker-icon.png',
              shadowUrl: 'assets/marker-shadow.png'
            })
          };
          const layer = marker(coords, options)
            .on('click', (e) => {
              this.zone.run(() => {
                this.selected.emit(row);
              });
            });
          this.layers.push(layer);
        }
      }
    });
  }

  changed() {
    console.log(this.map.getCenter(), this.map.getZoom());
    this.bounds.next(this.map.getBounds());
  }

  onMapReady(map_: Map) {
    this.map = map_;
    this.changed();
  }
}
