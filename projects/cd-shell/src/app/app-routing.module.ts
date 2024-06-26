import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { LayoutComponent } from './layouts/layout/layout.component';
import { loadRemoteModule } from '@angular-architects/module-federation';

const routes: Routes = [
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  // tslint:disable-next-line: max-line-length
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'pages',
    loadChildren: () => import('./extrapages/extrapages.module').then(m => m.ExtrapagesModule),
    // canActivate: [AuthGuard]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
