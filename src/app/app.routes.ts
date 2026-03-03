import { Routes } from '@angular/router';
import { PhotoLibraryComponent } from './features/photos/photo-library';
import { PhotoDetailsComponent } from './features/photos/photo-details';
import { FavoritesComponent } from './features/favorites/favorites';

export const routes: Routes = [
  {path: '',component: PhotoLibraryComponent},
  {path:'photo/:id', component: PhotoDetailsComponent},
  {path:'favorites', component: FavoritesComponent },
  { path: '**', redirectTo: '' }]
