import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-photo-skeleton',
  standalone: true,
  template: `<div class="skeleton-card">
  <div class="skeleton-image shimmer"></div>
  <div class="skeleton-content">
    <div class="skeleton-line shimmer"></div>
  </div>
</div>`,

  // Since this component never changes after it's shown, OnPush is perfect
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhotoSkeletonComponent {}
