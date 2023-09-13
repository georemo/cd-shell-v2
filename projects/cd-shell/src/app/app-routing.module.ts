import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { AuthGuard } from './core/guards/auth.guard';

import { LayoutComponent } from './layouts/layout/layout.component';

const routes: Routes = [
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule)
  },
  // tslint:disable-next-line: max-line-length
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
    canActivate: [AuthGuard]
  },
  ///////////////////////////////////////////////
  // manual route
  /////////////////
  // {
  //   path: 'user',
  //   component: LayoutComponent,
  //   loadChildren: () => import('user/PagesModule').then(m => m.PagesModule)
  // },
  ////////////////////////////////////
  // dynamic route without 
  //////////////////////////
  // {
  //   path: 'user',
  //   component: LayoutComponent,
  //   loadChildren: () =>
  //     loadRemoteModule({
  //       type: 'module',
  //       remoteEntry: 'http://localhost:4407/remoteEntry.js',
  //       exposedModule: './PagesModule'
  //     })
  //       .then(m => m.PagesModule)
  // },
  {
    path: 'user',
    component: LayoutComponent,
    loadChildren: () => loadRemoteModule({
        type: 'manifest',
        remoteName: 'user',
        exposedModule: './PagesModule'
      })
      .then(m => m.PagesModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
