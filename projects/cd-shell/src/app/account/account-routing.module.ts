import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router, RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {
  constructor(private router: Router) {
    this.monitorRouting();
  }

  private monitorRouting(): void {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        console.log('AccountRoutingModule::monitorRouting()/Navigation started to:', event.url);
      } else if (event instanceof NavigationEnd) {
        console.log('AccountRoutingModule::monitorRouting()/Navigation ended at:', event.url);
      } else if (event instanceof NavigationCancel) {
        console.warn('AccountRoutingModule::monitorRouting()/Navigation canceled:', event.url);
      } else if (event instanceof NavigationError) {
        console.error('AccountRoutingModule::monitorRouting()/Navigation error:', event.url, event.error);
      }
    });
  }
}
