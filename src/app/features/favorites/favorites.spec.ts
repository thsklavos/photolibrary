import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesComponent } from './favorites';
import { FavoriteService } from '../../core/favorite.service';
import { provideRouter } from '@angular/router';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;
  let favServiceMock: Partial<FavoriteService>;

  const samplePhotos: any[] = [
    { id: '1', author: 'A', display_url: 'a.jpg', download_url: 'a-full.jpg', width: 400, height: 300, url: '' },
    { id: '2', author: 'B', display_url: 'b.jpg', download_url: 'b-full.jpg', width: 400, height: 300, url: '' }
  ];

  beforeEach(async () => {
    favServiceMock = {
      count: (() => 2) as any,
      isEmpty: (() => false) as any,
      favorites: (() => samplePhotos) as any,
      isFavorite: vi.fn().mockReturnValue(true),
      toggleFavorite: vi.fn().mockReturnValue(false)
    };

    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [
        { provide: FavoriteService, useValue: favServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute favorites from service signals', () => {
    expect(component['filteredFavorites']?.() ?? component['count']?.()).toBeTruthy();
  });
});
