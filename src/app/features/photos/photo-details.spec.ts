import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoDetailsComponent } from './photo-details';
import { FavouriteService } from '../../core/favourite.service';
import { Router } from '@angular/router';


describe('PhotoDetailsComponent', () => {
  let component: PhotoDetailsComponent;
  let fixture: ComponentFixture<PhotoDetailsComponent>;
  let favServiceMock: Partial<FavouriteService>;
  let routerMock: Partial<Router>;

  const fakePhoto = { id: '1', author: 'A', display_url: 'a.jpg', download_url: 'a-full.jpg' };

  beforeEach(async () => {
    favServiceMock = {
      getFavourite: vi.fn().mockReturnValue(fakePhoto),
      removeFavouritePhoto: vi.fn()
    };

    routerMock = {
      navigate: vi.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [PhotoDetailsComponent],
      providers: [
        { provide: FavouriteService, useValue: favServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoDetailsComponent);
    component = fixture.componentInstance;

    // set input
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute photo from favourite service', () => {
    expect(favServiceMock.getFavourite).toHaveBeenCalledWith('1');
    expect(component.photo()).toEqual(fakePhoto);
  });

  it('removeFavourite should call service and navigate', () => {
    component.removeFavourite();
    expect(favServiceMock.removeFavouritePhoto).toHaveBeenCalledWith('1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});
