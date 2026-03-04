import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesComponent } from './favorites';
import { FavouriteService } from '../../core/favourite.service';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;
  let favServiceMock: Partial<FavouriteService>;

  const samplePhotos = [
    { id: '1', author: 'A', display_url: 'a.jpg', download_url: 'a-full.jpg' },
    { id: '2', author: 'B', display_url: 'b.jpg', download_url: 'b-full.jpg' }
  ];

  beforeEach(async () => {
    favServiceMock = {
      getFavouritePhotos: vi.fn().mockReturnValue(samplePhotos)
    };

    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [{ provide: FavouriteService, useValue: favServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute photos from favourite service', () => {
    expect(favServiceMock.getFavouritePhotos).toHaveBeenCalled();
    expect(component.photos()).toEqual(samplePhotos);
  });
});
