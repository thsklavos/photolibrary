import { Component, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PhotoCardComponent } from '../photos/photo-card';
import { FavoriteService } from '../../core/favorite.service';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-favorites',
  imports: [
    PhotoCardComponent,
    MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule
  ],
  template: `
    <div class="favorites-page">
      <div class="favorites-header">
        <div>
          <h1>Favorites <span class="count">({{ count() }})</span></h1>
          <p class="text-secondary">Your saved photos live here. Tap a card to view or toggle favorite.</p>
        </div>
        @if (!isEmpty()) {
          <button mat-stroked-button color="warn" (click)="confirmClearAll()">
            <mat-icon>delete_sweep</mat-icon>
            Clear all
          </button>
        }
      </div>

      @if (isEmpty()) {
        <div class="empty-state">
          <mat-icon>favorite_border</mat-icon>
          <h3>No favorites yet</h3>
          <p>Browse the library and tap the heart on any photo to save it here.</p>
          <button mat-raised-button color="primary" (click)="goToLibrary()">Browse Library</button>
        </div>
      } @else {
        <!-- Optional local search in favorites -->
        <div class="search-container" style="max-width: 360px; margin-bottom: 12px;">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            class="search-input"
            placeholder="Filter your favorites..."
            [value]="filterTerm()"
            (input)="filterTerm.set(($any($event.target)).value)"
            aria-label="Filter favorites"
          />
        </div>

        <div class="photo-grid">
          @for (photo of filteredFavorites(); track photo.id) {
            <app-photo-card
              [photo]="photo"
              (photoSelected)="viewPhoto($event)"
              (favoriteToggled)="onToggled($event)"
            />
          }
        </div>

        @if (filteredFavorites().length === 0) {
          <p class="text-center text-secondary" style="margin-top: 32px;">No favorites match the filter.</p>
        }
      }
    </div>
  `,
  styles: [`
    .favorites-page { padding-bottom: 40px; }
    .favorites-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 8px;
    }
    .favorites-header h1 { margin: 0 0 4px; font-size: 28px; font-weight: 600; }
    .count { color: var(--pl-text-secondary); font-weight: 400; }
  `]
})
export class FavoritesComponent {
  private readonly favoriteService = inject(FavoriteService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly count = this.favoriteService.count;
  readonly isEmpty = this.favoriteService.isEmpty;

  readonly filterTerm = signal('');

  readonly filteredFavorites = computed(() => {
    const term = this.filterTerm().trim().toLowerCase();
    const all = this.favoriteService.favorites();
    if (!term) return all;
    return all.filter(p => p.author.toLowerCase().includes(term));
  });

  viewPhoto(photo: Photo): void {
    this.router.navigate(['/photo', photo.id]);
  }

  onToggled(photo: Photo): void {
    // If it was removed via heart, the computed will update automatically
    if (!this.favoriteService.isFavorite(photo.id)) {
      this.snackBar.open('Removed from Favorites', 'Undo', { duration: 2800 })
        .onAction().subscribe(() => {
          this.favoriteService.addFavorite(photo);
        });
    }
  }

  goToLibrary(): void {
    this.router.navigate(['/']);
  }

  confirmClearAll(): void {
    // Simple native confirm for expert minimalism (can replace with real dialog)
    if (confirm(`Clear all ${this.count()} favorites? This cannot be undone.`)) {
      this.favoriteService.clearFavorites();
      this.snackBar.open('All favorites cleared', undefined, { duration: 2200 });
    }
  }
}
