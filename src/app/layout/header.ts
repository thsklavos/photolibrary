import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <span>Photo Library</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/">Home</a>
      <a mat-button routerLink="/favorites">Favorites</a>
    </mat-toolbar>
  `,})
export class HeaderComponent {

}
