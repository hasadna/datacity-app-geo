import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { latLng, geoJSON } from 'leaflet';
import { HttpClient } from '@angular/common/http';

function field(f) {
  return (row) => row[f];
}

function number(f) {
  return (row) => parseFloat(f(row)).toLocaleString('he-IL', {maximumFractionDigits: 2});
}

function currency(f) {
  return (row) => number(f)(row) + '₪';
}

const configs = {
  alqasum: {
    descriptor: 'תמונה חינוכית - מועצת אל-קסום',
    query: `
        select * from schools where "municipality-name" = 'אל קסום'
    `,
    title: field('school-name'),
    layer: 'assets/geojson/alqasum2.geojson',
    // layer: 'assets/geojson/muni_vaadim.geojson',
    // layerFilter: (f) => f.properties.Muni_Heb === 'אל קסום',
    center: latLng(31.296741262625222, 34.9691390991211),
    zoom: 11,
    gallery: (row, idx) => `https://datacity-source-files.fra1.digitaloceanspaces.com` +
                           `/69-AlQasum/Education/gallery/${row['school-symbol']}-${idx}.jpg`,
    sections: [
      {
        title: 'פרטי קשר',
        items: [
          {title: 'כתובת', value: field('address-full')},
          {title: 'מנהל/ת בית הספר', value: field('school-manager')},
          {title: 'אימייל', value: field('school-email-address')},
        ]
      },
      {
        title: 'מידע כללי',
        items: [
          {title: 'שנת ייסוד', value: field('school-founded-year')},
        ]
      },
      {
        title: 'מאפיינים',
        items: [
          {title: 'סוג בית הספר', value: field('school-kind')},
          {title: 'שלב חינוכי', value: field('school-phase')},
          {title: 'טווח כיתות', value: field('school-grade-range')},
          {title: 'תקציב בית הספר', value: currency(field('school-budget'))},
          {title: 'מספר כיתות רגילות', value: field('school-num-classrooms-regular')},
          {title: 'מספר כיתות מיוחדות', value: field('school-num-classrooms-special')},
          {title: 'מספר תלמידים', value: number(field('school-num-students'))},
          {title: 'מתוכם בחינוך מיוחד', value: field('school-num-students-special')},
        ]
      },
      {
        title: 'מידע מנהלי',
        items: [
          {title: 'פיקוח', value: field('school-oversight')},
          {title: 'מעמד משפטי', value: field('school-legal-status')},
          {title: 'מגזר', value: field('school-sector')},
          {title: 'סמל מוסד', value: field('school-symbol')},
        ]
      },
    ]
  },
  ashdod_business: {
    descriptor: 'מפת עסקים - אשדוד',
    // query: `
    //   with a as (select * from muni_businesses where "municipality-name" = 'אשדוד'),
    //   b as (select "business-name", "property-code", "business-kind" from a where "source-kind"='רישוי עסקים'),
    //   c as (select * from a where "source-kind"='ארנונה עסקים')
    //   select "address-full", "property-code", b."business-name", b."business-kind", "location-lat", "location-lon" from c
    //          join b using ("property-code") where b."business-name" is not null
    // `,
    query: `
      select * from muni_businesses where "municipality-name" = 'אשדוד' and "source-kind"='מאגר עסקים'
    `,
    title: field('business-name'),
    layer: 'assets/geojson/ashdod.geojson',
    center: latLng(31.799974756978738, 34.64384078979493),
    zoom: 12,
    gallery: (row, idx) => {
      const images = JSON.parse(row['property-code'] || "[]");
      return `https://datacity-source-files.fra1.digitaloceanspaces.com` +
             `/0070-Ashdod/Signage/img/${images[idx]}.jpg`;
    },
    sections: [
      {
        title: 'פרטים',
        items: [
          {title: 'כתובת', value: field('address-full')},
          {title: 'מהות הנכס', value: field('business-kind')},
          {title: 'טלפון', value: field('business-phone-number')},
        ]
      },
    ]
  }
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  public configuration = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    const queryString = new URLSearchParams(window.location.search);
    if (queryString.has('c')) {
      const conf = queryString.get('c');
      const config = configs[conf];
      if (config) {
        if (config.layer) {
          this.http.get(config.layer)
            .subscribe((data) => {
              config.layer = data;
              this.configuration.next(config);
            });
        } else {
          this.configuration.next(config);
        }
      }
    }
  }
}
