import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoDetailsComponent } from './photo-details';
import { FavoriteService } from '../../core/favorite.service';
import { PhotoService } from '../../core/photo.service';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { API_URL } from '../../core/tokens';
import { of } from 'rxjs';


describe('PhotoDetailsComponent', () => {
  let component: PhotoDetailsComponent;
  let fixture: ComponentFixture<PhotoDetailsComponent>;
  let favServiceMock: Partial<FavoriteService>;
  let routerMock: Partial<Router>;
  let photoServiceMock: Partial<PhotoService>;
  let httpMock: HttpTestingController;

  const fakePhoto: any = {
    id: '1', author: 'A', display_url: 'a.jpg', download_url: 'a-full.jpg',
    width: 5000, height: 3333, url: ''
  };

  beforeEach(async () => {
    favServiceMock = {
      isFavorite: vi.fn().mockReturnValue(true),
      toggleFavorite: vi.fn().mockReturnValue(true),
      addFavorite: vi.fn(),
      favorites: (() => [fakePhoto]) as any,
      count: (() => 1) as any
    };

    routerMock = { navigate: vi.fn() } as any;

    photoServiceMock = {
      getPhotoById: vi.fn().mockReturnValue(of(fakePhoto)),
      getDisplayUrl: vi.fn().mockReturnValue('https://picsum.photos/id/1/1200/900'),
      getDownloadUrl: vi.fn().mockReturnValue('https://picsum.photos/id/1/5000/3333'),
    };

    await TestBed.configureTestingModule({
      imports: [PhotoDetailsComponent],
      providers: [
        { provide: FavoriteService, useValue: favServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: PhotoService, useValue: photoServiceMock },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'https://picsum.photos' }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(PhotoDetailsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load photo via service and expose via signal', () => {
    // Because we mocked getPhotoById to return sync of(), after detectChanges photo should be set
    expect(component['photo']?.()).toEqual(fakePhoto);
  });
});
