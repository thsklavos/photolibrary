import { Injectable, signal, computed, effect } from '@angular/core';
import { Photo } from '../models/photo.model';

const STORAGE_KEY = 'favorite_photos';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  // Reactive source of truth
  private readonly _favorites = signal<Photo[]>(this.loadFromStorage());

  // Public readonly signals
  readonly favorites = this._favorites.asReadonly();
  readonly count = computed(() => this._favorites().length);
  readonly isEmpty = computed(() => this._favorites().length === 0);

  constructor() {
    // Auto-persist to localStorage whenever favorites change
    effect(() => {
      const favs = this._favorites();
      if (favs.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
      }
    });
  }

  private loadFromStorage(): Photo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  isFavorite(id: string | undefined): boolean {
    if (!id) return false;
    return this._favorites().some(p => p.id === id);
  }

  getFavorite(id: string | undefined): Photo | null {
    if (!id) return null;
    return this._favorites().find(p => p.id === id) ?? null;
  }

  toggleFavorite(photo: Photo): boolean {
    const current = this._favorites();
    const exists = current.some(p => p.id === photo.id);

    if (exists) {
      this._favorites.set(current.filter(p => p.id !== photo.id));
      return false;
    } else {
      this._favorites.set([...current, photo]);
      return true;
    }
  }

  addFavorite(photo: Photo): void {
    const current = this._favorites();
    if (!current.some(p => p.id === photo.id)) {
      this._favorites.set([...current, photo]);
    }
  }

  removeFavorite(id: string | undefined): void {
    if (!id) return;
    this._favorites.update(list => list.filter(p => p.id !== id));
  }

  clearFavorites(): void {
    this._favorites.set([]);
  }

  // For backward compat during transition if any old code
  /** @deprecated use favorites signal or isFavorite */
  getFavouritePhotos(): Photo[] { return this._favorites(); }
  /** @deprecated use toggleFavorite */
  addFavouritePhoto(p: Photo) { this.addFavorite(p); }
  /** @deprecated */
  removeFavouritePhoto(id?: string) { this.removeFavorite(id); }
  /** @deprecated */
  clearFavourites() { this.clearFavorites(); }
  /** @deprecated */
  getFavourite(id?: string) { return this.getFavorite(id); }
}
