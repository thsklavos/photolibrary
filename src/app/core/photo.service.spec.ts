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

  it('should fetch and transform photo data into LoadResult', async () => {
    const mockData = [{
      id: '1',
      author: 'Jane Doe',
      width: 5000,
      height: 3333,
      url: 'https://unsplash.com/...',
      download_url: 'https://picsum.photos/id/1/5000/3333'
    }];

    let result: any;
    service.getPhotos(1, 6).subscribe(r => { result = r; });

    const req = httpMock.expectOne(request => request.url.includes('v2/list'));
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    // wait out the artificial delay in service
    await new Promise(r => setTimeout(r, 320));

    expect(result.photos.length).toBe(1);
    expect(result.photos[0].display_url).toContain('/id/1/400/300');
    expect(result.hasMore).toBe(false);
  });

  it('should cache photo and serve getPhotoById from cache with no additional http', async () => {
    const mockData = [{
      id: '42', author: 'Cached', width: 100, height: 100,
      url: '', download_url: 'https://picsum.photos/id/42/5000/3333'
    }];

    let loadedPhotos: any[] = [];
    service.getPhotos(1, 1).subscribe(res => { loadedPhotos = res.photos; });

    const listReq = httpMock.expectOne(r => r.url.includes('v2/list'));
    listReq.flush(mockData);

    await new Promise(r => setTimeout(r, 320));

    expect(loadedPhotos.length).toBe(1);

    // getPhotoById from cache, no network
    let received: any = null;
    service.getPhotoById('42').subscribe(p => { received = p; });
    expect(received?.author).toBe('Cached');

    httpMock.expectNone((r: any) => String(r.url).includes('/id/42/info'));
  });
});
