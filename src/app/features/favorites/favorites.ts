import { Component,computed,inject} from '@angular/core';
import { FavouriteService } from '../../core/favourite.service';
import { PhotoCardComponent } from "../photos/photo-card";
import { MatGridListModule } from "@angular/material/grid-list";

@Component({
  selector: 'app-favorites',
  imports: [PhotoCardComponent, MatGridListModule],
  template:`
<mat-grid-list cols="3" rowHeight="1:1" gutterSize="16px">
  @for (photo of photos(); track photo.id; let i = $index) {
  <mat-grid-tile>
    <app-photo-card
      [photo]="photo"
      >
    </app-photo-card>
  </mat-grid-tile>

}
@empty {
  <p>No favourites</p>
}
</mat-grid-list>
`
  })
  export class FavoritesComponent {
    private favouriteService = inject(FavouriteService);
    readonly photos = computed(()=>this.favouriteService.getFavouritePhotos());
  }

