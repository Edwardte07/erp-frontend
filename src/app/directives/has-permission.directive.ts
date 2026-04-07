import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { PermissionsService } from '../services/permissions.service';

@Directive({
  selector: '[ifHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnChanges {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private permsService = inject(PermissionsService);

  @Input() ifHasPermission: string[] = [];

  ngOnChanges(): void {
    this.viewContainer.clear();
    if (this.permsService.hasAnyPermission(this.ifHasPermission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
