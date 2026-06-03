import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError, delay, map, Observable, of, tap, throwError } from 'rxjs';
import { Photo } from '../models/photo.model';
import { API_URL } from './tokens';

export interface LoadResult {
  photos: Photo[];
  hasMore: boolean;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  // In-memory cache of all loaded photos (keyed by id) - enables details for any seen photo
  private readonly _cache = signal<Record<string, Photo>>({});
  readonly cachedPhotos = computed(() => Object.values(this._cache()));

  private readonly DEFAULT_LIMIT = 18; // Good for 3-col grid, ~6 rows
  private readonly DISPLAY_W = 400;
  private readonly DISPLAY_H = 300;

  getPhotos(page: number, limit = this.DEFAULT_LIMIT): Observable<LoadResult> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any[]>(`${this.apiUrl}/v2/list`, { params }).pipe(
      delay(280), // Simulated realistic latency (keeps the "loading" feel as per original)
      map(raw => {
        const photos: Photo[] = raw.map(p => this.normalizePhoto(p));
        // Merge into cache
        this.mergeIntoCache(photos);
        const hasMore = raw.length === limit; // heuristic: if full page, assume more
        return { photos, hasMore };
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('PhotoService.getPhotos error', err);
        return throwError(() => new Error('Failed to load photos. Please check your connection and try again.'));
      })
    );
  }

  /** Get a single photo by id. Uses cache first, otherwise fetches /id/{id}/info */
  getPhotoById(id: string): Observable<Photo | null> {
    const cached = this._cache()[id];
    if (cached) {
      return of(cached);
    }
    return this.http.get<any>(`${this.apiUrl}/id/${id}/info`).pipe(
      map(raw => this.normalizePhoto(raw)),
      tap(photo => this.mergeIntoCache([photo])),
      catchError(() => of(null))
    );
  }

  /** Generate a high-res display URL for a photo (for modal/details) */
  getDisplayUrl(photo: Photo, w = 800, h = 600): string {
    return `${this.apiUrl}/id/${photo.id}/${w}/${h}`;
  }

  /** Full resolution for download */
  getDownloadUrl(photo: Photo): string {
    return photo.download_url;
  }

  /** Clear client cache (useful for dev/reset) */
  clearCache(): void {
    this._cache.set({});
  }

  private normalizePhoto(p: any): Photo {
    const id = String(p.id);
    return {
      id,
      author: p.author || 'Unknown',
      width: Number(p.width) || 0,
      height: Number(p.height) || 0,
      url: p.url || `https://picsum.photos/id/${id}/info`,
      download_url: p.download_url || `${this.apiUrl}/id/${id}/5000/3333`,
      display_url: `${this.apiUrl}/id/${id}/${this.DISPLAY_W}/${this.DISPLAY_H}`
    };
  }

  private mergeIntoCache(photos: Photo[]): void {
    if (!photos.length) return;
    this._cache.update(cache => {
      const next = { ...cache };
      for (const p of photos) {
        next[p.id] = p;
      }
      return next;
    });
  }
}
