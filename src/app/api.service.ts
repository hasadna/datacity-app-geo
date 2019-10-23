import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  performQuery(query: string): Observable<any[]> {
    query = encodeURIComponent(query);
    return this.http.get('https://api.datacity.org.il/api/query?num_rows=1000&query=' + query)
      .pipe(
        map((result: any) => result.rows)
      );
  }
}
