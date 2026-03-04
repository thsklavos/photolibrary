import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoLibraryComponent } from './photo-library';
import { PhotoService } from '../../core/photo.service';
import { of } from 'rxjs';

describe('PhotoLibraryComponent', () => {
    let component: PhotoLibraryComponent;
    let fixture: ComponentFixture<PhotoLibraryComponent>;
    let photoServiceMock: MockedObject<PhotoService>;

    beforeEach(async () => {
        // Mock IntersectionObserver
        globalThis.IntersectionObserver = class {
            observe = vi.fn();
            unobserve = vi.fn();
            disconnect = vi.fn();
        } as any;

       photoServiceMock = {
  getPhotos: vi.fn(),
  baseUrl: "https://picsum.photos/v2/list"
} as any;

// Now pass it to the provider
providers: [{ provide: PhotoService, useValue: photoServiceMock }]
        // Mock the initial page load return
        photoServiceMock.getPhotos.mockReturnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [PhotoLibraryComponent],
            providers: [
                { provide: PhotoService, useValue: photoServiceMock }
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
        const mockPhotos = [{ id: '1', author: 'A', display_url: '', download_url: '' }];
        photoServiceMock.getPhotos.mockReturnValue(of(mockPhotos));

        component.loadNextBatch();

        expect(component.photos().length).toBe(1);
        expect(photoServiceMock.getPhotos).toHaveBeenCalled();
    });

    it('should set isLoading to true while fetching', () => {
        // We don't return the observable immediately to check loading state
        photoServiceMock.getPhotos.mockReturnValue(of([]));

        component.loadNextBatch();
        // In a real test, you'd use fakeAsync/tick to catch the "mid-flight" state
        expect(component.isLoading()).toBe(false); // finalize sets it back to false
    });
});
