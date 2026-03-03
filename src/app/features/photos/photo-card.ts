import { Component, Input, ChangeDetectionStrategy, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Photo } from '../../models/photo.model';

@Component({
  selector: 'app-photo-card',
  imports: [NgOptimizedImage],
  template: `<div class="card-wrapper">
  <div class="image-container">
    <img
      [ngSrc]="photo().display_url"
      fill
      [alt]="'Photo by ' + photo().author"
      class="photo-img"
      [priority]="isPriority"
      (click)="handleClick()"
      >
  </div>

  <div class="card-footer">
    <span class="author-name">{{ photo().author }}</span>
    <button class="btn-view">View</button>
  </div>
</div>`,
changeDetection: ChangeDetectionStrategy.OnPush

})
export class PhotoCardComponent {
 photo = input.required<Photo>();
  isPriority = input(false);

  // New Output API (No more EventEmitter required!)
  photoSelected = output<Photo>();

  handleClick() {
    // We emit the value of the signal
    this.photoSelected.emit(this.photo());
  }
}
