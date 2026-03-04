import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PhotoService } from './photo.service';
import { API_URL } from './tokens';

describe('PhotoService', () => {
  let service: PhotoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PhotoService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'https://picsum.photos' }
      ]
    });
    service = TestBed.inject(PhotoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensures no unmatched requests are outstanding
  });

  it('should fetch and transform photo data', () => {
    const mockData = [{ id: '1', author: 'Jane Doe', download_url: 'https://picsum.photos/id/1/5000/3333' }];

    service.getPhotos(1, 6).subscribe(photos => {
      expect(photos.length).toBe(1);
      expect(photos[0].display_url).toBe('https://picsum.photos/id/1/200/300');
    });

    const req = httpMock.expectOne(request => request.url.includes('v2/list'));
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
