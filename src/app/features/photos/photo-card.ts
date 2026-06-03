import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Photo } from '../../models/photo.model';
import { FavoriteService } from '../../core/favorite.service';

@Component({
  selector: 'app-photo-card',
  imports: [NgOptimizedImage, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="photo-card card" (click)="onCardClick($event)">
      <div class="image-container">
        <img
          [ngSrc]="photo().display_url"
          [alt]="'Photo by ' + photo().author"
          class="photo-img"
          [priority]="isPriority()"
          width="400"
          height="300"
          (click)="onImageClick($event)"
        />

        <!-- Favorite toggle (stops propagation so doesn't open details) -->
        <button
          type="button"
          class="favorite-btn"
          [class.favorited]="isFavorite()"
          (click)="onToggleFavorite($event)"
          [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
          mat-icon-button
        >
          <mat-icon>{{ isFavorite() ? 'favorite' : 'favorite_border' }}</mat-icon>
        </button>
      </div>

      <div class="meta">
        <span class="author" [title]="photo().author">{{ photo().author }}</span>
        <div class="actions">
          <button mat-icon-button (click)="onViewClick($event)" aria-label="View photo details">
            <mat-icon>zoom_in</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Additional component styles layered on global .photo-card */
    .photo-card { height: 100%; display: flex; flex-direction: column; }
    .image-container { flex: 1; }
  `]
})
export class PhotoCardComponent {
  readonly photo = input.required<Photo>();
  readonly isPriority = input(false);

  // Emits when user wants to view details (image or view button)
  readonly photoSelected = output<Photo>();
  // Emits when favorite toggled (parent can react or ignore)
  readonly favoriteToggled = output<Photo>();

  private favoriteService = inject(FavoriteService);

  readonly isFavorite = () => this.favoriteService.isFavorite(this.photo().id);

  protected onCardClick(event: MouseEvent): void {
    // Only trigger view if not clicking on buttons inside
    if ((event.target as HTMLElement).closest('button')) return;
    this.photoSelected.emit(this.photo());
  }

  protected onImageClick(event: MouseEvent): void {
    event.stopPropagation();
    this.photoSelected.emit(this.photo());
  }

  protected onViewClick(event: MouseEvent): void {
    event.stopPropagation();
    this.photoSelected.emit(this.photo());
  }

  protected onToggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    this.favoriteService.toggleFavorite(this.photo());
    this.favoriteToggled.emit(this.photo());
  }
}
