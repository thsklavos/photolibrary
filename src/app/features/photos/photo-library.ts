import { Component, ElementRef, inject, signal, computed, ViewChild, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { PhotoService, LoadResult } from '../../core/photo.service';
import { Photo, SortOption } from '../../models/photo.model';
import { PhotoCardComponent } from "./photo-card";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { FavoriteService } from '../../core/favorite.service';

@Component({
  selector: 'app-photo-library',
  imports: [
    PhotoCardComponent,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatSelectModule
  ],
  template: `
    <div class="library-page">
      <!-- Toolbar: search + sort + stats -->
      <div class="toolbar">
        <div class="search-container">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            #searchInput
            type="text"
            class="search-input"
            placeholder="Search authors (e.g. Alejandro)"
            [value]="searchTerm()"
            (input)="onSearchInput($event)"
            aria-label="Search photos by author"
          />
          @if (searchTerm()) {
            <button mat-icon-button class="clear-btn" (click)="clearSearch()" aria-label="Clear search">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>

        <div class="toolbar-actions">
          <mat-form-field appearance="outline" class="sort-field" subscriptSizing="dynamic">
            <mat-select [value]="sortOption()" (selectionChange)="onSortChange($event.value)" aria-label="Sort photos">
              <mat-option value="newest">Newest first</mat-option>
              <mat-option value="oldest">Oldest first</mat-option>
              <mat-option value="author-asc">Author A → Z</mat-option>
              <mat-option value="author-desc">Author Z → A</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button (click)="refresh()" [disabled]="isLoading()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-bar">
        <span>
          {{ filteredPhotos().length }} photos
          @if (searchTerm()) { matching “{{ searchTerm() }}” }
          @if (totalLoaded() > filteredPhotos().length) { (of {{ totalLoaded() }} loaded) }
        </span>
        @if (hasMore()) {
          <span class="text-secondary">• Scroll for more</span>
        }
      </div>

      <!-- Content -->
      @if (error()) {
        <div class="empty-state">
          <mat-icon>error_outline</mat-icon>
          <p>{{ error() }}</p>
          <button mat-raised-button color="primary" (click)="loadNextBatch(true)">Try again</button>
        </div>
      } @else if (isLoading() && photos().length === 0) {
        <!-- Initial skeleton grid -->
        <div class="photo-grid">
          @for (_ of skeletonArray(); track $index) {
            <div class="card skeleton" style="aspect-ratio: 4/3; height: 220px;"></div>
          }
        </div>
      } @else if (filteredPhotos().length === 0 && !isLoading()) {
        <div class="empty-state">
          <mat-icon>photo_library</mat-icon>
          @if (searchTerm()) {
            <p>No photos match your search.</p>
            <button mat-button (click)="clearSearch()">Clear search</button>
          } @else {
            <p>No photos loaded yet.</p>
          }
        </div>
      } @else {
        <!-- Photo Grid -->
        <div class="photo-grid">
          @for (photo of filteredPhotos(); track photo.id; let i = $index) {
            <app-photo-card
              [photo]="photo"
              [isPriority]="i < 9"
              (photoSelected)="onPhotoSelected($event)"
              (favoriteToggled)="onFavoriteToggled($event)"
            />
          }
        </div>

        <!-- Infinite scroll anchor + Load more -->
        <div #scrollAnchor class="scroll-anchor"></div>

        <div class="load-more">
          @if (isLoading()) {
            <div class="loading-row">
              <mat-spinner diameter="28"></mat-spinner>
              <span>Loading more photos…</span>
            </div>
          } @else if (hasMore()) {
            <button mat-raised-button color="primary" (click)="loadNextBatch()">
              Load more photos
            </button>
          } @else if (photos().length > 0) {
            <div class="end-marker">You've reached the end of the library ({{ photos().length }} photos loaded)</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .library-page { display: flex; flex-direction: column; gap: 16px; }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }
    .toolbar-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .sort-field { width: 180px; }
    .clear-btn { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); }
    .stats-bar {
      font-size: 13px;
      color: var(--pl-text-secondary);
      padding: 4px 0;
    }
    .loading-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 12px;
      color: var(--pl-text-secondary);
    }
    .load-more {
      display: flex;
      justify-content: center;
      padding: 24px 0 8px;
    }
    .end-marker {
      font-size: 13px;
      color: #64748b;
      padding: 8px 16px;
      background: #f1f5f9;
      border-radius: 999px;
    }
    .search-container { position: relative; flex: 1; min-width: 260px; max-width: 420px; }
  `]
})
export class PhotoLibraryComponent implements AfterViewInit, OnDestroy {
  private readonly photoService = inject(PhotoService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly router = inject(Router);

  // State
  readonly photos = signal<Photo[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasMore = signal(true);
  readonly page = signal(1);
  readonly searchTerm = signal('');
  readonly sortOption = signal<SortOption>('newest');

  private observer?: IntersectionObserver;
  private searchDebounce?: ReturnType<typeof setTimeout>;

  @ViewChild('scrollAnchor') anchor!: ElementRef;

  // Derived
  readonly totalLoaded = computed(() => this.photos().length);

  readonly filteredPhotos = computed(() => {
    let list = this.photos();

    // Client-side search
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(p => p.author.toLowerCase().includes(term));
    }

    // Sort (stable)
    const sort = this.sortOption();
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'newest': return Number(b.id) - Number(a.id);
        case 'oldest': return Number(a.id) - Number(b.id);
        case 'author-asc': return a.author.localeCompare(b.author);
        case 'author-desc': return b.author.localeCompare(a.author);
        default: return 0;
      }
    });
    return list;
  });

  readonly skeletonArray = computed(() => Array(12).fill(0));

  constructor() {
    // Auto-load first batch (expert pattern - effect for init)
    // We use a one-time flag inside to avoid loops
  }

  private hasInitialized = false;

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    // Initial load (guaranteed after view for anchor)
    if (!this.hasInitialized && this.photos().length === 0) {
      this.hasInitialized = true;
      this.loadNextBatch();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.isLoading() && this.hasMore() && !this.error()) {
          this.loadNextBatch();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    setTimeout(() => {
      if (this.anchor?.nativeElement) {
        this.observer?.observe(this.anchor.nativeElement);
      }
    }, 80);
  }

  loadNextBatch(reset = false): void {
    if (this.isLoading() || (!this.hasMore() && !reset)) return;

    if (reset) {
      this.photos.set([]);
      this.page.set(1);
      this.hasMore.set(true);
      this.error.set(null);
      this.photoService.clearCache();
    }

    this.isLoading.set(true);
    this.error.set(null);

    const currentPage = this.page();

    this.photoService.getPhotos(currentPage).subscribe({
      next: (result: LoadResult) => {
        if (reset) {
          this.photos.set(result.photos);
        } else {
          this.photos.update(curr => [...curr, ...result.photos]);
        }
        this.hasMore.set(result.hasMore);
        this.page.set(currentPage + 1);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message || 'Failed to load photos');
        this.isLoading.set(false);
      }
    });
  }

  onPhotoSelected(photo: Photo): void {
    this.router.navigate(['/photo', photo.id]);
  }

  onFavoriteToggled(_photo: Photo): void {
    // Badge in header is already reactive via FavoriteService.count
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.searchTerm.set(value);
    }, 140);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    const input = document.querySelector<HTMLInputElement>('.search-input');
    if (input) input.value = '';
  }

  onSortChange(option: SortOption): void {
    this.sortOption.set(option);
  }

  refresh(): void {
    this.loadNextBatch(true);
  }
}

