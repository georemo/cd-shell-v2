import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event as RouterEvent } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'reset-password',
        component: PasswordresetComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {
    constructor(private router: Router) {
        this.monitorRouting();
    }

    private monitorRouting(): void {
        this.router.events.subscribe((event: RouterEvent) => {
            if (event instanceof NavigationStart) {
                console.log('AuthRoutingModule::monitorRouting()/Navigation started to:', event.url, 'with state:', event.restoredState);
            } else if (event instanceof NavigationEnd) {
                console.log('AuthRoutingModule::monitorRouting()/Navigation ended at:', event.url, 'with state:', event.urlAfterRedirects);
            } else if (event instanceof NavigationCancel) {
                console.warn('AuthRoutingModule::monitorRouting()/Navigation canceled:', event.url, 'with reason:', event.reason);
            } else if (event instanceof NavigationError) {
                console.error('AuthRoutingModule::monitorRouting()/Navigation error:', event.url, event.error);
            }
        });
    }
}
