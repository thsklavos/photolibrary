import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoCardComponent } from './photo-card';
import { Photo } from '../../models/photo.model';

describe('PhotoCardComponent', () => {
    let component: PhotoCardComponent;
    let fixture: ComponentFixture<PhotoCardComponent>;

    const testPhoto: Photo = {
        id: '123',
        author: 'Test Author',
        display_url: 'test.jpg',
        download_url: 'test-full.jpg'
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PhotoCardComponent] // Standalone components go in imports
        }).compileComponents();

        fixture = TestBed.createComponent(PhotoCardComponent);
        component = fixture.componentInstance;

        // Setting the Signal Input correctly
        fixture.componentRef.setInput('photo', testPhoto);
        fixture.detectChanges();
    });

    it('should display the author name', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test Author');
    });

    it('should emit photoSelected signal-output when clicked', () => {
        // Spy on the new output API
        const spy = vi.fn();
        component.photoSelected.subscribe(spy);

        const img = fixture.nativeElement.querySelector('.photo-img');
        img.click();

        expect(spy).toHaveBeenCalledWith(testPhoto);
    });
});
