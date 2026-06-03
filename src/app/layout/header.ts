import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FavoriteService } from '../core/favorite.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="header-inner">
        <a routerLink="/" class="brand" aria-label="PhotoLibrary home">
          <mat-icon>photo_library</mat-icon>
          <span>PhotoLibrary</span>
        </a>

        <span class="spacer"></span>

        <nav class="nav-links" aria-label="Main navigation">
          <a matButton="text" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
            <mat-icon>grid_view</mat-icon>
            <span>Library</span>
          </a>
          <a matButton="text" routerLink="/favorites" routerLinkActive="active">
            <mat-icon>favorite</mat-icon>
            <span>Favorites</span>
            @if (favCount() > 0) {
              <span class="fav-badge" [attr.aria-label]="favCount() + ' favorites'">{{ favCount() }}</span>
            }
          </a>
        </nav>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      background: linear-gradient(90deg, #4338ca, #6366f1);
      color: white;
      padding: 0 16px;
      box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
    }
    .header-inner {
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      height: 64px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.025em;
      color: white;
      text-decoration: none;
    }
    .brand mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-links a {
      color: rgba(255,255,255,0.85);
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 500;
      transition: all 150ms ease;
    }
    .nav-links a:hover { color: white; background: rgba(255,255,255,0.12); }
    .nav-links a.active { color: white; background: rgba(255,255,255,0.2); }
    .nav-links a mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .fav-badge {
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 999px;
      min-width: 18px;
      text-align: center;
      line-height: 16px;
    }
  `]
})
export class HeaderComponent {
  private favoriteService = inject(FavoriteService);
  readonly favCount = this.favoriteService.count;
}
