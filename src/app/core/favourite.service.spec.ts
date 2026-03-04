import { TestBed } from '@angular/core/testing';
import { FavouriteService } from './favourite.service';
import { Photo } from '../models/photo.model';

describe('FavouriteService', () => {
  let service: FavouriteService;
  const samplePhotos: Photo[] = [
    { id: '1', author: 'A', display_url: 'a.jpg', download_url: 'a-full.jpg' },
    { id: '2', author: 'B', display_url: 'b.jpg', download_url: 'b-full.jpg' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavouriteService);

    // clear localStorage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveFavouritePhotos and getFavouritePhotos', () => {
    it('should persist and retrieve photos from localStorage', () => {
      service.saveFavouritePhotos(samplePhotos);
      const retrieved = service.getFavouritePhotos();
      expect(retrieved).toEqual(samplePhotos);
    });

    it('getFavouritePhotos returns empty array when nothing stored', () => {
      expect(service.getFavouritePhotos()).toEqual([]);
    });
  });

  describe('getFavourite', () => {
    it('should return the matching photo by id', () => {
      service.saveFavouritePhotos(samplePhotos);
      expect(service.getFavourite('2')).toEqual(samplePhotos[1]);
    });

    it('should return null when photo not found', () => {
      service.saveFavouritePhotos(samplePhotos);
      expect(service.getFavourite('xyz')).toBeNull();
    });

    it('should return null when id is undefined', () => {
      service.saveFavouritePhotos(samplePhotos);
      expect(service.getFavourite(undefined)).toBeNull();
    });
  });

  describe('addFavouritePhoto', () => {
    it('should add a new photo when none exist', () => {
      service.addFavouritePhoto(samplePhotos[0]);
      expect(service.getFavouritePhotos()).toEqual([samplePhotos[0]]);
    });

    it('should not add a duplicate photo', () => {
      service.saveFavouritePhotos([samplePhotos[0]]);
      service.addFavouritePhoto(samplePhotos[0]);
      expect(service.getFavouritePhotos()).toEqual([samplePhotos[0]]);
    });
  });

  describe('removeFavouritePhoto', () => {
    it('should remove a photo by id', () => {
      service.saveFavouritePhotos(samplePhotos);
      service.removeFavouritePhoto('1');
      expect(service.getFavouritePhotos()).toEqual([samplePhotos[1]]);
    });

    it('should clear storage if last photo removed', () => {
      service.saveFavouritePhotos([samplePhotos[0]]);
      service.removeFavouritePhoto('1');
      expect(localStorage.getItem('favourite_photos')).toBeNull();
    });
  });

  describe('clearFavourites', () => {
    it('should remove the storage key', () => {
      service.saveFavouritePhotos(samplePhotos);
      service.clearFavourites();
      expect(localStorage.getItem('favourite_photos')).toBeNull();
    });
  });
});
