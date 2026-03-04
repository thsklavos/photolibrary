import { Injectable } from '@angular/core';
import { Photo } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class FavouriteService {
  private readonly STORAGE_KEY = 'favourite_photos';

  // 1. SET / INITIALIZE: Save a full array
  saveFavouritePhotos(photos: Photo[]): void {
    const data = JSON.stringify(photos);
    localStorage.setItem(this.STORAGE_KEY, data);
  }

  // 2. GET: Retrieve and parse the array
  getFavouritePhotos(): Photo[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

 // 3. GET: Retrieve the favourite photo
  getFavourite(id:string | undefined){
    const currentFavouritePhotos = this.getFavouritePhotos();
    const photo:Photo | undefined = currentFavouritePhotos.find(p => p.id === id);
    return photo? photo : null;
  }

  // 4. UPDATE: Add a new object to the existing array
  addFavouritePhoto(newPhoto: Photo): void {
    const currentFavouritePhotos = this.getFavouritePhotos();
    // Prevent duplicates by checking ID
    if (!currentFavouritePhotos.find(p => p.id === newPhoto.id)) {
      const updated = [...currentFavouritePhotos, newPhoto];
      this.saveFavouritePhotos(updated);
    }
  }

  // 5. REMOVE: Remove a specific object by ID
  removeFavouritePhoto(photoId: string | undefined): void {
    const currentFavouritePhotos = this.getFavouritePhotos();
    const filtered = currentFavouritePhotos.filter(p => p.id !== photoId);
    // if removing last item, clear storage instead of writing an empty array
    if (filtered.length === 0) {
      this.clearFavourites();
    } else {
      this.saveFavouritePhotos(filtered);
    }
  }

  // 6. CLEAR: Delete everything
  clearFavourites(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
