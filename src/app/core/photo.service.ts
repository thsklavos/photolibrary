import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { delay, map, Observable } from 'rxjs';
import { Photo } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://picsum.photos/v2/list';

  getPhotos(page: number, limit: number = 6): Observable<Photo[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any[]>(this.baseUrl, { params }).pipe(
      delay(300), // Our 300ms loading requirement
      map(response => response.map(p => ({
        id: p.id,
        author: p.author,
        download_url: p.download_url,
        // We transform the URL to request a specific size for our grid
        display_url: `https://picsum.photos/id/${p.id}/200/300`
      })))
    );
  }
}
