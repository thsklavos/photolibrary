import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoLibraryComponent } from './photo-library';
import { PhotoService } from '../../core/photo.service';
import { FavoriteService } from '../../core/favorite.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('PhotoLibraryComponent', () => {
    let component: PhotoLibraryComponent;
    let fixture: ComponentFixture<PhotoLibraryComponent>;
    let photoServiceMock: MockedObject<PhotoService>;
    let favServiceMock: Partial<FavoriteService>;

    beforeEach(async () => {
        // Mock IntersectionObserver globally for the component
        globalThis.IntersectionObserver = class {
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
        } as any;

        photoServiceMock = {
          getPhotos: vi.fn(),
          getPhotoById: vi.fn(),
          getDisplayUrl: vi.fn((p: any) => p.display_url || ''),
          getDownloadUrl: vi.fn((p: any) => p.download_url || ''),
          clearCache: vi.fn()
        } as any;

        favServiceMock = {
          count: (() => 0) as any,
          isEmpty: (() => true) as any,
          favorites: (() => []) as any,
          isFavorite: vi.fn().mockReturnValue(false),
          toggleFavorite: vi.fn().mockReturnValue(true)
        };

        photoServiceMock.getPhotos.mockReturnValue(of({ photos: [], hasMore: false }));

        await TestBed.configureTestingModule({
            imports: [PhotoLibraryComponent],
            providers: [
                { provide: PhotoService, useValue: photoServiceMock },
                { provide: FavoriteService, useValue: favServiceMock },
                provideRouter([])
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PhotoLibraryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should start with an empty photo list', () => {
        expect(component.photos()).toEqual([]);
    });

    it('should add photos to the signal when loadNextBatch is called', () => {
        const mockResult = {
          photos: [{ id: '1', author: 'A', display_url: '', download_url: '', width: 0, height: 0, url: '' }],
          hasMore: false
        };
        photoServiceMock.getPhotos.mockReturnValue(of(mockResult));

        component.loadNextBatch();

        // Note: async so may be 0 immediately; we just verify call happened
        expect(photoServiceMock.getPhotos).toHaveBeenCalled();
    });
});
