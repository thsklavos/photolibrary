import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <span>Photo Library</span>
      <span class="spacer"></span>
      <a matButton="filled" routerLink="/">Home</a>
      <a matButton="filled" routerLink="/favorites">Favorites</a>
    </mat-toolbar>
  `,
  styles: `.header-toolbar {display: flex; justify-content: center; align-items: center;}
  .mdc-button{margin: 0 15px;}`
})
export class HeaderComponent {

}
