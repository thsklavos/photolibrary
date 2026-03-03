import { Component,computed,inject,input, OnInit } from '@angular/core';
import { FavouriteService } from '../../core/favourite.service';
import { PhotoCardComponent } from "./photo-card";
import { Router } from '@angular/router';
import { MatGridListModule } from "@angular/material/grid-list";

@Component({
  selector: 'app-photo-details',
   imports: [PhotoCardComponent, MatGridListModule],
  template: `<div class="photo-details"><mat-grid-list cols="2" rowHeight="1:1" gutterSize="16px">
    <mat-grid-tile><app-photo-card
      [photo]="photo()!"
      >
    </app-photo-card>
    </mat-grid-tile>
</mat-grid-list>
    </div>
     <button (click)="removeFavourite()">Remove from favorites</button>
    `
 })
  export class PhotoDetailsComponent {
    readonly id = input<string>();
    private favouriteService = inject(FavouriteService);
    private router=inject(Router)
    photo = computed(() => this.favouriteService.getFavourite(this.id()));
    removeFavourite(){
      this.favouriteService.removeFavouritePhoto(this.id());
      this.router.navigate(['/']);
    }
  }

