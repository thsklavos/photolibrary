import { Component, Input, ChangeDetectionStrategy, input } from '@angular/core';
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
      class="photo-img">
  </div>

  <div class="card-footer">
    <span class="author-name">{{ photo().author }}</span>
    <button class="btn-view">View</button>
  </div>
</div>`,
changeDetection: ChangeDetectionStrategy.OnPush

})
export class PhotoCardComponent {
 readonly photo= input.required<Photo>();


}
