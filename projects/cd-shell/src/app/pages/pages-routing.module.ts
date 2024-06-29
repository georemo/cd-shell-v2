import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ChatComponent } from './chat/chat.component';
import { KanbanComponent } from './kanban/kanban.component';
import { loadRemoteModule } from '@angular-architects/module-federation';

const routes: Routes = [
    // { path: '', component: DashboardComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'calendar', component: CalendarComponent },
    { path: 'chat', component: ChatComponent },
    { path: 'kanban-board', component: KanbanComponent },
    { path: '', loadChildren: () => import('../account/account.module').then(m => m.AccountModule) },
    { path: 'ecommerce', loadChildren: () => import('./ecommerce/ecommerce.module').then(m => m.EcommerceModule) },
    { path: 'email', loadChildren: () => import('./email/email.module').then(m => m.EmailModule) },
    { path: 'pages', loadChildren: () => import('./utility/utility.module').then(m => m.UtilityModule) },
    { path: 'ui', loadChildren: () => import('./ui/ui.module').then(m => m.UIModule) },
    { path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },
    { path: 'charts', loadChildren: () => import('./chart/chart.module').then(m => m.ChartModule) },
    { path: 'form', loadChildren: () => import('./form/form.module').then(m => m.FormModule) },
    { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
    { path: 'maps', loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule) },
    // {
    //     path: 'user',
    //     loadChildren: () => loadRemoteModule({
    //         type: 'manifest',
    //         remoteName: 'cd-user',
    //         exposedModule: './PagesModule'
    //     })
    //         .then(m => m.PagesModule)
    // },
    // {
    //     path: 'login',
    //     loadChildren: () => loadRemoteModule({
    //         type: 'manifest',
    //         remoteName: 'cd-user',
    //         exposedModule: './LoginComponent'
    //     })
    //         .then(m => m.AccountModule)
    // },
    // {
    //     path: 'comm',
    //     loadChildren: () => loadRemoteModule({
    //         type: 'manifest',
    //         remoteName: 'cd-comm',
    //         exposedModule: './PagesModule'
    //     })
    //         .then(m => m.PagesModule)
    // },
    {
        path: 'user',
        loadChildren: () =>
            loadRemoteModule({
                remoteEntry: 'https://cd-user.asdap.net/remoteEntry.js',
                remoteName: 'cdUser',
                exposedModule: './UserFrontModule'
            })
                .then(m => m.UserFrontModule)
    },
    {
        path: 'pms',
        loadChildren: () =>
            loadRemoteModule({
                remoteEntry: 'https://cd-pms.asdap.africa/remoteEntry.js',
                remoteName: 'cdPms',
                exposedModule: './PmsModule'
            })
                .then(m => m.PmsModule)
    },
    {
        path: 'comm',
        loadChildren: () =>
            loadRemoteModule({
                remoteEntry: 'https://cd-comm.asdap.net/remoteEntry.js',
                remoteName: 'cdComm',
                exposedModule: './MemoModule'
            })
                .then(m => m.MemoModule)
    },
    /**
     * Note how the memo and inte-ract are served from one remote app cdComm
     * - check the remoteEntry is the same but different exposed module
     * - you can got to the remote project to see how it is also configured
     * to allow this to happen
     */
    {
        path: 'memo',
        loadChildren: () =>
            loadRemoteModule({
                remoteEntry: 'https://cd-memo.asdap.africa/remoteEntry.js',
                remoteName: 'cdComm',
                exposedModule: './MemoModule'
            })
                .then(m => m.MemoModule)
    },
    {
        path: 'inte-ract',
        loadChildren: () =>
            loadRemoteModule({
                remoteEntry: 'https://cd-interact.asdap.africa/remoteEntry.js',
                remoteName: 'cdComm',
                exposedModule: './InteRactModule'
            })
                .then(m => m.InteRactModule)
    },
    {
        path: 'moduleman',
        loadChildren: () =>
            loadRemoteModule({
                remoteEntry: 'https://cd-moduleman.asdap.net/remoteEntry.js',
                remoteName: 'cdModuleman',
                exposedModule: './ModulemanModule'
            })
                .then(m => m.ModulemanModule)
    },
    // {
    //     path: 'menu',
    //     loadChildren: () =>
    //         loadRemoteModule({
    //             remoteEntry: 'https://asdap.africa/remoteEntry.js',
    //             remoteName: 'cdModuleman',
    //             exposedModule: './MenuModule'
    //         })
    //             .then(m => m.MenuModule)
    // },
    ////////////////////////////////////////////////
    // {
    //     path: 'hrm',
    //     loadChildren: () =>
    //         loadRemoteModule({
    //             remoteEntry: 'https://cd-hrm.asdap.africa/remoteEntry.js',
    //             remoteName: 'cdHrm',
    //             exposedModule: './RecruitModule'
    //         })
    //             .then(m => m.RecruitModule)
    // }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
