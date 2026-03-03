import { Component, inject, signal } from '@angular/core';
@Component({
  selector: 'app-photo-library',
  template: `<div class="photo-library">
    <h2>{{title()}}</h2>
    <p>Welcome to the photo library! Browse and manage your photos here.</p></div>`,

})
export class PhotoLibraryComponent {
  readonly title = signal('Photo Library');
}
