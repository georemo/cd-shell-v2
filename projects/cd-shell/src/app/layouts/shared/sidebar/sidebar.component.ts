/**
 * note: sender.cdObjId.resourceGuid is used to id the sender and the origin app.
 */
import { v4 as uuidv4 } from 'uuid';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
// import MetisMenu from 'metismenujs/dist/metismenujs';
import MetisMenu from 'metismenujs';
// import { IO, ioEvent } from 'rxjs-socket.io';
import { Router, NavigationEnd } from '@angular/router';
import { map, mergeMap } from 'rxjs/operators';
import { EventService } from '../../../core/services/event.service';
import {
  MenuCollection, MenuService, SocketIoService, SioClientService, UserService,
  IdleTimeoutService, IAppState, WebsocketService, BaseService,
  // WsHttpService,
  CdObjId, ICdResponse, ICdPushEnvelop, ISocketItem
} from '@corpdesk/core';
import { HtmlElemService, HtmlCtx } from '@corpdesk/core/src/lib/guig';
import { MenuItem } from './menu.model';
import { environment } from 'src/environments/environment';
// import { SioClientService } from '../../../core/services/sio-client.service';

let $ = new HtmlElemService();
interface IdleTimerOptions {
  inactivityTime: number,
  actionCallback: () => void
}
const idleTimerOptions: IdleTimerOptions = {
  inactivityTime: 900,
  actionCallback: () => { console.log('starting actionCallback()') }
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {
  resourceName = 'SidebarComponent';
  resourceGuid = '';
  jwtWsToken = '';
  menu: any;
  menuItems = [] as any;
  @ViewChild('sideMenu') sideMenu: ElementRef;
  toggleEvents: number[] = [];
  routParams = {
    queryParams: { token: '' },
    skipLocationChange: true,
    replaceUrl: false
  };
  constructor(
    private elementRef: ElementRef,
    private eventService: EventService,
    private router: Router,
    private svMenu: MenuService,
    private svWs: WebsocketService,
    private svHtml: HtmlElemService,
    private svUser: UserService,
    private svIdleTimeout: IdleTimeoutService,
    public cd: ChangeDetectorRef,
    private svBase: BaseService,
    private svSio: SioClientService,
  ) {
    this.svSio.env = environment;
    this.svSio.initSio(this, this.onPushRegisteredClient);

    $ = this.svHtml;
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
      }
    });
  }

  ngOnInit(): void {
    console.log('starting SidebarComponent::ngOnInit()');
    this.initialize();
  }

  ngAfterViewInit() {
    console.log('starting ngAfterViewInit()');
    this.setAppId()
    this._activateMenuDropdown();
    this.initSession();
  }

  saveSocket(payLoad: ICdPushEnvelop) {
    console.log('SidebarComponent::saveSocket()/payLoad:', payLoad);
    /**
     * - get socketStore
     * - search socketStore for item with name='appInit'
     * - remove existing item with the same key
     * - save socketData to LocalStorage with resourceGuide as reference
     */
    const socketData: ISocketItem[] | null = payLoad.pushData.appSockets.filter(appInit)
    function appInit(s: ISocketItem): ISocketItem | null {
      if (s.name === 'appInit') {
        return s;
      } else {
        return null;
      }
    }

    if (socketData.length > 0) {
      const socketStr = JSON.stringify(socketData)
      localStorage.removeItem('socketData');
      localStorage.setItem('socketData', socketStr);
    }
  }

  setAppId() {
    console.log('starting SidebarComponent::setAppId()')
    localStorage.removeItem('appId');
    localStorage.setItem('appId', this.svBase.getGuid());
    const envl: ICdPushEnvelop = this.configPushPayload('register-client', 'push-registered-client', 1000)
    this.svSio.sendPayLoad(envl)
  }

  configPushPayload(triggerEvent: string, emittEvent: string, cuid: number | string): ICdPushEnvelop {
    console.log('starting cd-shell-v2::SidebarComponent::configPushPayload()');
    const pushEnvelope: ICdPushEnvelop = {
      pushData: {
        pushGuid: '',
        m: '',
        pushRecepients: [],
        triggerEvent: '',
        emittEvent: '',
        token: '',
        isNotification: null,
        appSockets: [],
        isAppInit: true,
        commTrack: {
          initTime: Number(new Date()),
          relayTime: null,
          relayed: false,
          pushed: false,
          pushTime: null,
          deliveryTime: null,
          delivered: false,
          completed: false,
          completedTime: null
        },
      },
      req: null,
      resp: null
    }

    const users = [
      {
        userId: cuid,
        subTypeId: 1,
        cdObjId: {
          appId: environment.appId,
          ngModule: 'SharedModule',
          resourceName: 'SidebarComponent',
          resourceGuid: uuidv4(),
          jwtToken: '',
          socket: null,
          socketId: '',
          commTrack: {
            initTime: Number(new Date()),
            relayTime: null,
            relayed: false,
            pushed: false,
            pushTime: null,
            deliveryTime: null,
            delivered: false,
            completed: false,
            completedTime: null
          },
        },
      },
    ]

    const envl: ICdPushEnvelop = { ...pushEnvelope };
    envl.pushData.triggerEvent = triggerEvent;
    envl.pushData.emittEvent = emittEvent;

    // set sender
    const uSender: any = { ...users[0] }
    uSender.subTypeId = 1;
    envl.pushData.pushRecepients.push(uSender)


    /**
     * recepient is only used when sending message to 
     * remote user or component.
     * In this case we are just connecting and
     * collecting connection info.
     */
    // set recepient
    // const uRecepient: any = { ...users[0] }
    // uRecepient.subTypeId = 7;
    // envl.pushData.pushRecepients.push(uRecepient)

    console.log('starting cd-user-v2::LoginComponent::configPushPayload()/envl:', envl);

    return envl;

  }

  registerWsService() {
    console.log('SidebarComponent::registerWsService()/01');
    this.resourceGuid = this.svBase.getGuid();
    console.log('SidebarComponent::registerWsService()/this.resourceGuid:', this.resourceGuid);
    const key = this.resourceGuid;
    const value: CdObjId = {
      appId: localStorage.getItem('appId')!,
      ngModule: 'SharedModule',
      resourceName: 'SidebarComponent',
      resourceGuid: this.resourceGuid,
      jwtToken: this.jwtWsToken,
      socket: null,
      commTrack: {
        initTime: Number(new Date()),
        relayTime: null,
        relayed: false,
        pushed: false,
        pushTime: null,
        deliveryTime: null,
        delivered: false,
        completed: false,
        completedTime: null
      }
    }

    const env = {
      ctx: 'Sys',
      m: 'CdPush',
      c: 'Websocket',
      a: 'Create',
      dat: {
        f_vals: [
          {
            data: value
          }
        ],
        token: ''
      },
      args: {}
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  idleTimerCallback() {
    // console.log('starting idleTimerCallback()');
    this.router.navigate(['/user/login'])
    return true;
  }

  /**
   * Initialize
   */
  initialize(): void {
    console.log('starting initialize()');
  }

  initSession() {
    const authData = {
      userName: 'anon',
      password: '-',
      consumerGuid: environment.consumerToken
    }
    this.svUser.setEnv(environment);
    this.svUser.auth$(authData)
      .pipe(
        map((res: any) => res.data.menuData),
        mergeMap((m) => {
          return this.svMenu.getMenu$(`cdMenu` as MenuCollection, m)
        })
      ).subscribe((menuData) => {
        this.htmlMenu(menuData);
      })
  }

  // set all the events that compose-doc should listen to
  pushSubscribe(cls: any) {
    console.log('SidebarComponent::pushSubscribe()/01');
    // this.initWebSocket();
    // this.svSocket.listen('push-menu')
    //   .subscribe((data: any) => {
    //     console.log('SidebarComponent::pushSubscribe()/data:', data);
    //     // start idletimeout
    //     this.routParams.queryParams.token = data.token;
    //     this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
    //     // load appropriate menu
    //     this.htmlMenu(data.m);
    //   });

    // this.soiService.sioListen('push-menu')
    //   .subscribe((data: any) => {
    //     console.log('SidebarComponent::pushSubscribe()/data:', data);
    //     // start idletimeout
    //     this.routParams.queryParams.token = data.token;
    //     this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
    //     // load appropriate menu
    //     this.htmlMenu(data.m);
    //   })


    cls.listenSecure('push-registered-client')
      .subscribe((payLoadStr: string) => {
        console.log('SidebarComponent::listenSecure()/push-registered-client/:payLoadStr:', payLoadStr)
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          console.log('SidebarComponent::pushSubscribe()/payLoad:', payLoad);
          this.saveSocket(payLoad);
        }
      })

    cls.listenSecure('push-menu')
      .subscribe((payLoadStr: string) => {
        console.log('SidebarComponent::listenSecure()/push-menu/:payLoadStr:', payLoadStr)
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          console.log('SidebarComponent::pushSubscribe()/payLoad:', payLoad);
          // start idletimeout
          this.routParams.queryParams.token = payLoad.pushData.token;
          this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
          // load menu
          const menuData = JSON.parse(payLoad.pushData.m);
          if (menuData) {
            this.htmlMenu(JSON.parse(payLoad.pushData.m));
          }
        }
      })



    // this.socket.listenToEvent(this.pushMenuEvent).event$
    // .subscribe((data) => {
    //       console.log('SidebarComponent::pushSubscribe()/data:', data);
    //     // start idletimeout
    //     this.routParams.queryParams.token = data.token;
    //     this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
    //     // load appropriate menu
    //     this.htmlMenu(data.m);
    // });


    // const cacheData = {
    //   key: this.svBase.cacheKey('User', 'User', 'Login', `${userId}`, cdToken!),
    //   value: JSON.stringify(pushEnvelop)
    // }

    //get launch time
    const launchTime = ((new Date()).getTime() / 1000).toString();

    // get browser tab id

    // get standard session id

    // query the latest localStorage for session that matches 'this' session
    // const items = { ...localStorage };
    // console.log('SidebarComponent::pushSubscribe()/localStorage:', localStorage);

    // iterate localStorage
    // for (let i = 0; i < localStorage.length; i++) {
    //   try {
    //     // set iteration key name
    //     const key = localStorage.key(i);
    //     // use key name to retrieve the corresponding value
    //     var value = localStorage.getItem(key!);
    //     // console.log the iteration key and value
    //     console.log('Key: ' + key + ', Value: ' + value);
    //     const appState:IAppState = JSON.parse(value!);
    //     console.log('SidebarComponent::pushSubscribe()/jValue:', appState);
    //     if(appState.sess!.cd_token!){
    //       const cdToken = appState.sess!.cd_token;
    //       console.log('SidebarComponent::pushSubscribe()/cdToken:', cdToken);
    //     }
    //     if(appState.sess!.initUuid!){
    //       const initUuid = appState.sess!.initUuid;
    //       console.log('SidebarComponent::pushSubscribe()/initUuid:', initUuid);
    //     }
    //     if(appState.sess!.initTime!){
    //       const initTime = appState.sess!.initTime;
    //       console.log('SidebarComponent::pushSubscribe()/initTime:', initTime);
    //     }
    //   } catch (e) {
    //     console.log('SidebarComponent::pushSubscribe()/Error:', e);
    //   }

    // }

  }

  onPushRegisteredClient(cls:any, payLoadStr) {
    console.log('SidebarComponent::onPushRegisteredClient():payLoadStr:', payLoadStr)
    if (payLoadStr) {
      // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
      // console.log('SidebarComponent::pushSubscribe()/payLoad:', payLoad);
      cls.saveSocket(payLoadStr);
    }
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className: any) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  /**
   * Activate the parent dropdown
   */
  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl: any = null;

    const paths: any = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < links.length; i++) {
      // tslint:disable-next-line: no-string-literal
      paths.push(links[i]['pathname']);
    }
    const itemIndex = paths.indexOf(window.location.pathname);
    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex).toString();
      menuItemEl = links[paths.indexOf(item)];
    } else {
      menuItemEl = links[itemIndex];
    }

    if (menuItemEl) {
      menuItemEl.classList.add('active');
      const parentEl = menuItemEl.parentElement;

      if (parentEl) {
        parentEl.classList.add('mm-active');

        const parent2El = parentEl.parentElement.closest('ul');
        if (parent2El && parent2El.id !== 'side-menu') {
          parent2El.classList.add('mm-show');
          const parent3El = parent2El.parentElement;

          if (parent3El && parent3El.id !== 'side-menu') {
            parent3El.classList.add('mm-active');
            const childAnchor = parent3El.querySelector('.has-arrow');
            const childDropdown = parent3El.querySelector('.has-dropdown');

            if (childAnchor) { childAnchor.classList.add('mm-active'); }
            if (childDropdown) { childDropdown.classList.add('mm-active'); }

            const parent4El = parent3El.parentElement;
            if (parent4El && parent4El.id !== 'side-menu') {
              parent4El.classList.add('mm-show');
              const parent5El = parent4El.parentElement;
              if (parent5El && parent5El.id !== 'side-menu') {
                parent5El.classList.add('mm-active');
                const childanchor = parent5El.querySelector('.is-parent');
                if (childanchor && parent5El.id !== 'side-menu') { childanchor.classList.add('mm-active'); }
              }
            }
          }
        }
      }
    }
  }
  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }

  /**
   * Light sidebar
   */
  lightSidebar() {
    document.body.setAttribute('data-sidebar', 'light');
    document.body.setAttribute('data-topbar', 'dark');
    document.body.removeAttribute('data-sidebar-size');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.classList.remove('vertical-collpsed');
  }

  /**
   * Compact sidebar
   */
  compactSidebar() {
    document.body.setAttribute('data-sidebar-size', 'small');
    document.body.setAttribute('data-sidebar', 'dark');
    document.body.removeAttribute('data-topbar');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.classList.remove('sidebar-enable');
    document.body.classList.remove('vertical-collpsed');
  }

  /**
   * Icon sidebar
   */
  iconSidebar() {
    document.body.classList.add('sidebar-enable');
    document.body.classList.add('vertical-collpsed');
    document.body.setAttribute('data-sidebar', 'dark');
    document.body.removeAttribute('data-layout-size');
    document.body.removeAttribute('data-keep-enlarged');
    document.body.removeAttribute('data-topbar');
  }

  /**
   * Boxed layout
   */
  boxedLayout() {
    document.body.setAttribute('data-keep-enlarged', 'true');
    document.body.setAttribute('data-layout-size', 'boxed');
    document.body.setAttribute('data-sidebar', 'dark');
    document.body.classList.add('vertical-collpsed');
    document.body.classList.remove('sidebar-enable');
    document.body.removeAttribute('data-topbar');
  }

  /**
   * Colored sidebar
   */
  coloredSidebar() {
    document.body.setAttribute('data-sidebar', 'colored');
    document.body.removeAttribute('data-sidebar-size');
    document.body.removeAttribute('data-layout-size');
    document.body.classList.remove('vertical-collpsed');
    document.body.removeAttribute('data-topbar');
  }

  async htmlMenu(menuData: MenuItem[]) {
    this.toggleEvents = [];
    console.log('htmlMenu()/01')
    console.log('htmlMenu()/menuData:', menuData)
    if (menuData) {
      this.htmlRootMenu(menuData).then(() => {
        this.activateDropdown(menuData);
      })
    }
  }

  async htmlRootMenu(menuData: MenuItem[]) {
    // clear container
    (document.getElementById('sidebar-menu') as HTMLElement).innerHTML = '';
    let h: HtmlCtx = {
      elementRef: this.elementRef,
      selector: '#sidebar-menu',
      srtHtml: await this.htmlMenuContainer('root', null),
      position: 'afterbegin'
    };
    // append root container
    $.append(h)
      .then(async (success) => {
        // build root menus
        let rootMenus = '';
        // if(menuData){
        //   menuData = [];
        // }
        menuData.forEach((mi: MenuItem) => {
          rootMenus += this.htmlMenuItem(mi);
        });

        h = {
          elementRef: this.elementRef,
          selector: '#side-menu',
          srtHtml: await rootMenus,
          position: 'afterbegin'
        };
        //insert menus to root container
        $.append(h)
          .then(() => {
            // for each menu item, set children
            menuData.forEach(async (mi: MenuItem) => {
              this.htmlChildren(mi, menuData)
            });
          })
      })
  }

  async htmlChildren(mi: MenuItem, parentData: MenuItem[]) {
    let h: HtmlCtx = {
      elementRef: this.elementRef,
      selector: `#li_${mi.id}`,
      srtHtml: await this.htmlMenuContainer('subMenu', mi),
      position: 'beforeend'
    };
    // set subMenu container
    await $.append(h)
      .then(async (success) => {
        // set children html
        let htmlSubMenu = '';
        mi.subItems.forEach((sm) => {
          htmlSubMenu += this.htmlMenuItem(sm);
        });
        //insert menus to sub-menu container
        h = {
          elementRef: this.elementRef,
          selector: `#ul_${mi.id}`,
          srtHtml: await htmlSubMenu,
          position: 'afterbegin'
        };
        $.append(h).then(() => {
          this.activateDropdown(parentData);
          mi.subItems.forEach((sm) => {
            this.setRoutTarget(sm);
          });
        });
      })

  }

  activateDropdown(parentData: MenuItem[]) {
    console.log('SidebarComponent::activateDropdown()/01')
    console.log('SidebarComponent::activateDropdown()/parentData:', parentData)
    parentData.forEach((mi: MenuItem) => {
      console.log('SidebarComponent::activateDropdown()/01')
      const parentElem = document.getElementById(`a_${mi.id?.toString()}`) as HTMLElement;
      if (parentElem) {
        if (!this.isRepeatedEvent(mi.id!)) {
          this.saveEvent(mi.id!);
          // add event to menu ul
          parentElem.addEventListener('click', (e: Event) => this.toggleSetting(mi.id));
        }
      }
    });

    // const menuElem = document.getElementById(`a_${menuItem.id?.toString()}`) as HTMLElement;
    // if(menuElem && menuItem.link){
    //   menuElem.addEventListener('click', (e: Event) => this.setRoutTarget(menuItem.link));
    // }
  }

  saveEvent(id: number) {
    if (id) {
      this.toggleEvents.push(id);
    }
  }

  isRepeatedEvent(id: number) {
    const repeatedEvents = this.toggleEvents.filter((e) => e === id);
    if (repeatedEvents.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  elemExists(selector) {
    const elem = this.elementRef.nativeElement.querySelector(selector) as HTMLElement;
    if (elem) {
      return true;
    } else {
      return false;
    }
  }

  async htmlMenuContainer(type, menuItem: MenuItem | null) {
    if (type === 'root') {
      return `<ul id="side-menu" class="metismenu list-unstyled"></ul>`;
    }
    else if (type === 'subMenu' && menuItem) {
      return `<ul id="ul_${menuItem.id}" aria-expanded="false" class="sub-menu mm-collapse">`;
    }
    else {
      return '';
    }
  }

  htmlMenuItem(menuItem: MenuItem): string {
    let hasArrow = '';
    let link = '';
    if ('subItems' in menuItem) {
      if (menuItem.subItems.length > 0) {
        hasArrow = 'has-arrow';
      }
    }
    if (menuItem.link) {
      link = 'href="javascript:void(0);"'
    } else {
      link = '';
    }
    return `
        <li id="li_${menuItem.id}" class="mm-active">
          <a id="a_${menuItem.id}" ${link} aria-expanded="false" class="is-parent ${hasArrow} mm-active">
            <i id="i_${menuItem.id}" class="bx ${menuItem.icon}"></i>
            <span id="span_${menuItem.id}">${menuItem.label}</span>
          </a>
        </li>
    `;
  }

  toggleSetting(menuId) {
    const strId = `ul_${menuId.toString()}`;
    const menuItemEl = document.getElementById(strId) as HTMLElement;
    if (menuItemEl) {
      menuItemEl.classList.toggle('active');
      menuItemEl.classList.toggle('mm-show');
    }
  }

  setRoutTarget(menuItem: MenuItem) {
    const strId = `a_${menuItem.id!.toString()}`;
    const menuItemEl = document.getElementById(strId) as HTMLElement;
    if (menuItemEl && menuItem.link) {
      if (menuItem.moduleIsPublic) {
        menuItemEl.addEventListener('click', (e: Event) => this.router.navigate([menuItem.link]));
      } else {
        menuItemEl.addEventListener('click', (e: Event) => this.router.navigate([menuItem.link], this.routParams));
      }
    }
  }

}
