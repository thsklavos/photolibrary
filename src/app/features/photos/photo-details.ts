import { Component, inject, input, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Photo } from '../../models/photo.model';
import { PhotoService } from '../../core/photo.service';
import { FavoriteService } from '../../core/favorite.service';

@Component({
  selector: 'app-photo-details',
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="details-page">
      @if (isLoading()) {
        <div class="loading-center">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading photo…</p>
        </div>
      } @else if (error()) {
        <div class="empty-state">
          <mat-icon>broken_image</mat-icon>
          <p>{{ error() }}</p>
          <div style="display:flex; gap:8px; justify-content:center;">
            <button mat-stroked-button (click)="goBack()">Back to Library</button>
            <button mat-raised-button color="primary" (click)="retry()">Retry</button>
          </div>
        </div>
      } @else if (photo(); as photo) {
        <div class="details-layout">
          <!-- Hero Image -->
          <div class="hero">
            <img
              [src]="largeImageUrl()"
              [alt]="'Full resolution photo by ' + photo.author"
              class="hero-img"
              (error)="onImageError($event)"
            />
            <div class="hero-overlay">
              <button mat-fab extended color="primary" (click)="toggleFavorite()" class="fav-action">
                <mat-icon>{{ isFavorited() ? 'favorite' : 'favorite_border' }}</mat-icon>
                {{ isFavorited() ? 'Favorited' : 'Add to Favorites' }}
              </button>
            </div>
          </div>

          <!-- Info Card -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>{{ photo.author }}</mat-card-title>
              <mat-card-subtitle>Photo #{{ photo.id }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <dl class="meta-list">
                <div><dt>Original size</dt><dd>{{ photo.width }} × {{ photo.height }} px</dd></div>
                <div><dt>Aspect ratio</dt><dd>{{ aspectRatio() }}</dd></div>
                <div><dt>Source</dt>
                  <dd><a [href]="photo.url" target="_blank" rel="noopener noreferrer">View on Unsplash ↗</a></dd>
                </div>
              </dl>
            </mat-card-content>

            <mat-card-actions align="end">
              <button mat-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon> Back
              </button>
              <button mat-stroked-button (click)="copyLink(photo)">
                <mat-icon>link</mat-icon> Copy Link
              </button>
              <button mat-raised-button color="primary" (click)="download(photo)">
                <mat-icon>download</mat-icon> Download Full Res
              </button>
              <button mat-stroked-button color="warn" (click)="toggleFavorite(true)">
                <mat-icon>{{ isFavorited() ? 'remove_circle' : 'add_circle' }}</mat-icon>
                {{ isFavorited() ? 'Remove Favorite' : 'Favorite' }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .details-page { padding-bottom: 48px; }
    .loading-center, .empty-state { text-align: center; padding: 80px 20px; }
    .details-layout { display: grid; gap: 24px; }
    .hero {
      position: relative;
      border-radius: var(--pl-radius);
      overflow: hidden;
      box-shadow: var(--pl-shadow-lg);
      background: #111;
    }
    .hero-img {
      width: 100%;
      max-height: 72vh;
      object-fit: contain;
      display: block;
      background: #0f172a;
    }
    .hero-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 24px;
      background: linear-gradient(to top, rgba(15,23,42,0.75), transparent);
      display: flex;
      justify-content: flex-end;
    }
    .fav-action { box-shadow: 0 4px 12px rgb(0 0 0 / 0.3); }
    .info-card { max-width: 820px; margin: 0 auto; }
    .meta-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 32px;
      margin: 8px 0 0;
    }
    .meta-list dt {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--pl-text-secondary);
      margin-bottom: 2px;
    }
    .meta-list dd { margin: 0; font-weight: 500; }
    .meta-list a { color: var(--pl-primary); text-decoration: none; }
    .meta-list a:hover { text-decoration: underline; }
    @media (max-width: 640px) {
      .meta-list { grid-template-columns: 1fr; }
    }
  `]
})
export class PhotoDetailsComponent {
  readonly id = input<string>();

  private readonly photoService = inject(PhotoService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly photo = signal<Photo | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly largeImageUrl = computed(() => {
    const p = this.photo();
    return p ? this.photoService.getDisplayUrl(p, 1200, 900) : '';
  });

  readonly isFavorited = computed(() => {
    const p = this.photo();
    return p ? this.favoriteService.isFavorite(p.id) : false;
  });

  readonly aspectRatio = computed(() => {
    const p = this.photo();
    if (!p || !p.width || !p.height) return '—';
    const ratio = (p.width / p.height);
    return ratio.toFixed(2) + ':1';
  });

  constructor() {
    // React to id input changes
    effect(() => {
      const id = this.id();
      if (id) {
        this.loadPhoto(id);
      }
    });
  }

  private loadPhoto(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.photo.set(null);

    this.photoService.getPhotoById(id).subscribe({
      next: (found) => {
        if (found) {
          this.photo.set(found);
        } else {
          this.error.set('Photo not found. It may have been removed from the source.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load photo details.');
        this.isLoading.set(false);
      }
    });
  }

  toggleFavorite(forceRemove = false): void {
    const p = this.photo();
    if (!p) return;

    const wasFav = this.favoriteService.isFavorite(p.id);
    const nowFav = this.favoriteService.toggleFavorite(p);

    const message = nowFav
      ? 'Added to Favorites'
      : (forceRemove || wasFav) ? 'Removed from Favorites' : 'Added to Favorites';

    this.snackBar.open(message, 'Dismiss', { duration: 2200, horizontalPosition: 'center' });
  }

  download(photo: Photo): void {
    const url = this.photoService.getDownloadUrl(photo);
    const link = document.createElement('a');
    link.href = url;
    link.download = `photo-${photo.id}-${photo.author.replace(/\s+/g, '-')}.jpg`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Download started', undefined, { duration: 1600 });
  }

  async copyLink(photo: Photo): Promise<void> {
    const url = `${window.location.origin}/photo/${photo.id}`;
    try {
      await navigator.clipboard.writeText(url);
      this.snackBar.open('Link copied to clipboard', undefined, { duration: 1800 });
    } catch {
      // fallback
      prompt('Copy this link:', url);
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.photo()!.display_url; // fallback
  }

  retry(): void {
    const id = this.id();
    if (id) this.loadPhoto(id);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

