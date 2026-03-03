import { Routes } from '@angular/router';
import { PhotoLibraryComponent } from './features/photos/photo-library';

export const routes: Routes = [ {path: '',component: PhotoLibraryComponent},{ path: '**', redirectTo: '' },]
