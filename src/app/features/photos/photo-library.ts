import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { PhotoService } from '../../core/photo.service';
import { Photo } from '../../models/photo.model';
import { PhotoCardComponent } from "./photo-card";
import { PhotoSkeletonComponent } from "./photo-skeleton";
import { MatGridListModule} from '@angular/material/grid-list';
import { FavouriteService } from '../../core/favourite.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-photo-library',
  imports: [PhotoCardComponent, PhotoSkeletonComponent,MatGridListModule],
  template: `<div class="photo-library">
    <div class="library-container">
  <div class="library-container">
  <mat-grid-list cols="3" rowHeight="1:1" gutterSize="16px">


  @for (photo of photos(); track photo.id; let i = $index) {
  <mat-grid-tile>
    <app-photo-card
      [photo]="photo"
      [isPriority]="i < 6"
      (photoSelected)="onPhotoSelected($event)">
    </app-photo-card>
  </mat-grid-tile>
}


    @if (isLoading()) {
      @for (i of [1,2,3,4,5,6]; track i) {
        <mat-grid-tile>
          <app-photo-skeleton></app-photo-skeleton>
        </mat-grid-tile>
      }
    }
  </mat-grid-list>

  <div #scrollAnchor class="scroll-sensor">Loading ...</div>
</div>

  <div #scrollAnchor class="scroll-anchor">
    @if (!isLoading() && photos().length > 0) {
      <span class="pull-up-text">Complete Loading</span>
    }
  </div>
</div>`,
    styles:`

.anchor {
  height: 50px;
  width: 100%;
}`

})
export class PhotoLibraryComponent {
  private photoService = inject(PhotoService);
  private favouriteService = inject(FavouriteService);
  private router = inject(Router);

  photos = signal<Photo[]>([]);
  isLoading = signal(false);
  page = 1;
  private readonly BATCH_SIZE = 6;
  private observer?: IntersectionObserver;

  @ViewChild('scrollAnchor') anchor!: ElementRef;

  ngAfterViewInit() {
    this.setupObserver();
  }

  private setupObserver() {
    this.observer = new IntersectionObserver(([entry]) => {
      // Trigger when anchor is visible and we aren't already fetching
      if (entry.isIntersecting && !this.isLoading()) {
        this.loadNextBatch();
      }
    }, { threshold: 0.1 });

    this.observer.observe(this.anchor.nativeElement);
  }

  loadNextBatch() {
    this.isLoading.set(true);

    this.photoService.getPhotos(this.page, this.BATCH_SIZE).subscribe({
      next: (newPhotos) => {
        this.photos.update(all => [...all, ...newPhotos]);
        this.page++;
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPhotoSelected(photoSelected:Photo){
    console.log(photoSelected);
    this.favouriteService.addFavouritePhoto(photoSelected);
    this.router.navigate(['photo',photoSelected.id]);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}

