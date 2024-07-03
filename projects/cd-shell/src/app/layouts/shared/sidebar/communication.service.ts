import { Injectable } from '@angular/core';
import { SidebarComponent } from './sidebar.component'; // Adjust the path as necessary
import { MenuItem } from './menu.model';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private sidebarComponent: SidebarComponent | null = null;

  registerSidebar(sidebarComponent: SidebarComponent): void {
    this.sidebarComponent = sidebarComponent;
  }

  async callHtmlMenu(menuData: MenuItem[], cdToken:string): Promise<void> {
    if (this.sidebarComponent) {
      await this.sidebarComponent.htmlMenu(menuData, cdToken);
    } else {
      console.error('SidebarComponent not registered.');
    }
  }

  getSidebar() {
    return this.sidebarComponent;
  }
}
