import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterOutlet } from '@angular/router';
import { AccountRoutingModule } from './account-routing.module';
import { AuthModule } from './auth/auth.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AccountRoutingModule,
    RouterModule, RouterLink, RouterOutlet,
    AuthModule
  ]
})
export class AccountModule { }
