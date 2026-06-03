import { TestBed } from '@angular/core/testing';
import { FavoriteService } from './favorite.service';
import { Photo } from '../models/photo.model';

describe('FavoriteService', () => {
  let service: FavoriteService;
  const samplePhotos: Photo[] = [
    { id: '1', author: 'A', display_url: 'a.jpg', download_url: 'a-full.jpg', width: 400, height: 300, url: '' },
    { id: '2', author: 'B', display_url: 'b.jpg', download_url: 'b-full.jpg', width: 400, height: 300, url: '' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoriteService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signals API', () => {
    it('favorites signal starts empty and count is reactive', () => {
      expect(service.favorites()).toEqual([]);
      expect(service.count()).toBe(0);
      expect(service.isEmpty()).toBe(true);
    });

    it('toggleFavorite adds and removes, updates signals', () => {
      const added = service.toggleFavorite(samplePhotos[0]);
      expect(added).toBe(true);
      expect(service.count()).toBe(1);
      expect(service.isFavorite('1')).toBe(true);

      const removed = service.toggleFavorite(samplePhotos[0]);
      expect(removed).toBe(false);
      expect(service.count()).toBe(0);
    });

    it('updates signal on add (persistence effect covered in integration)', () => {
      service.addFavorite(samplePhotos[0]);
      expect(service.favorites().length).toBe(1);
      expect(service.favorites()[0].id).toBe('1');
    });
  });

  describe('deprecated methods (backward compat)', () => {
    it('addFavouritePhoto / getFavouritePhotos still work', () => {
      service.addFavouritePhoto(samplePhotos[0]);
      expect(service.getFavouritePhotos().length).toBe(1);
    });
  });

  describe('getFavorite / isFavorite', () => {
    it('returns correct values', () => {
      service.addFavorite(samplePhotos[1]);
      expect(service.getFavorite('2')).toEqual(samplePhotos[1]);
      expect(service.getFavorite('999')).toBeNull();
      expect(service.isFavorite(undefined)).toBe(false);
    });
  });

  describe('clearFavorites', () => {
    it('empties list and removes storage key', () => {
      service.addFavorite(samplePhotos[0]);
      service.clearFavorites();
      expect(service.isEmpty()).toBe(true);
      expect(localStorage.getItem('favorite_photos')).toBeNull();
    });
  });
});
