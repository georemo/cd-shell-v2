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
import { HtmlElemService, HtmlCtx } from '@corpdesk/core';
import { MenuItem } from './menu.model';
import { environment } from 'src/environments/environment';
import { PusherService } from '../../../core/services/pusher.service';
import { MenuDataService } from './menu-data.service';
// import { SioClientService } from '../../../core/services/sio-client.service';
import { CommunicationService } from './communication.service';
import { SioClientTestService } from '../../../core/services/sio-client-test.service';
import { NGXLogger } from 'ngx-logger';

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
  cdToken = '';
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

  // for pusher
  messages: string[] = [];
  newMessage: string = '';

  sioSocket: any;



  constructor(
    private logger: NGXLogger,
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
    private svSioTest: SioClientTestService,
    private svPusher: PusherService,
    private communicationService: CommunicationService,
  ) {
    // this.svSio.env = environment;
    // this.svSio.initSio(this, this.socketAction);

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
    console.log('SidebarComponent::setAppId()/01')
    console.log('SidebarComponent::setAppId()/this.svSio.socket:', this.svSio.socket)
    localStorage.removeItem('appId');
    localStorage.setItem('appId', this.svBase.getGuid());
    const appId = localStorage.getItem('appId');
    console.log('SidebarComponent::setAppId()/appId:', appId)
    const envl: ICdPushEnvelop = this.configPushPayload('register-client', 'push-registered-client', 1000)
    console.log('SidebarComponent::setAppId()/envl:', envl)
    // this.svSio.sendPayLoad(envl)


    this.listen('push-registered-client')
    this.listen('push-msg-relayed')
    this.listen('push-msg-pushed')
    this.listen('push-delivered')
    this.listen('msg-relayed')
    this.listen('msg-menu')
    this.listen('push-menu')
    this.sendSioMessage(envl)
  }

  configPushPayload(triggerEvent: string, emittEvent: string, cuid: number | string): ICdPushEnvelop {
    console.log('starting cd-shell-v2::SidebarComponent::configPushPayload()');
    this.resourceGuid = this.svBase.getGuid();


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

    console.log('cd-shell-v2::SidebarComponent::configPushPayload()/this.resourceGuid:', this.resourceGuid);
    const key = this.resourceGuid;
    const cdObj: CdObjId = {
      appId: localStorage.getItem('appId')!,
      ngModule: 'SharedModule',
      resourceName: 'SidebarComponent',
      resourceGuid: this.resourceGuid,
      jwtToken: this.jwtWsToken,
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
    }

    localStorage.setItem(key, JSON.stringify(cdObj));

    const users = [
      {
        userId: cuid,
        subTypeId: 1,
        cdObjId: cdObj,
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

    console.log('starting cd-shell-v2::SidebarComponent::configPushPayload()/envl:', envl);

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


    // register itself with the CommunicationService when it initializes
    this.communicationService.registerSidebar(this);

    //initialize socket.io service
    // this.svSio.env = environment;
    // this.svSio.initSio(this, this.socketAction);
    this.setAppId()


    // initialize pusher
    // this.svPusher.subscribe('my-channel', 'my-event', (data) => {
    //   this.messages.push(data.message);
    //   console.log("data received:", data)
    //   console.log("messages:", this.messages)
    // });

    // test pusher
    // this.sendMessage()

    // test sio for listening to 
    // this.svSioTest.listen('push-registered-client')
    //   .subscribe((payLoadStr: string) => {
    //     console.log('SidebarComponent::initialize()/this.svSioTest.listen/:payLoadStr:', payLoadStr)
    //     if (payLoadStr) {
    //       const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
    //       console.log('SidebarComponent::pushSubscribe()/payLoad:', payLoad);
    //       this.saveSocket(payLoad);
    //     }
    //   })
  }


  // [
  //   {
  //     triggerEvent: 'register-client',
  //     emittEvent: 'push-registered-client',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'srv-received',
  //     emittEvent: 'push-srv-received',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'msg-relayed',
  //     emittEvent: 'push-msg-relayed',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'msg-pushed',
  //     emittEvent: 'push-msg-pushed',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'msg-received',
  //     emittEvent: 'push-delivered',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'msg-completed',
  //     emittEvent: 'push-msg-completed',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'register',
  //     emittEvent: 'registered',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'login',
  //     emittEvent: 'push-menu',
  //     sFx: 'pushEnvelop'
  //   },
  //   {
  //     triggerEvent: 'send-memo',
  //     emittEvent: 'push-memo',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'send-pub',
  //     emittEvent: 'push-pub',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'send-react',
  //     emittEvent: 'push-react',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'send-menu',
  //     emittEvent: 'push-menu',
  //     sFx: 'push'
  //   },
  //   {
  //     triggerEvent: 'send-notif',
  //     emittEvent: 'push-notif',
  //     sFx: 'push'
  //   }
  // ]
  listen(event) {
    this.logger.info('cd-shell/SidebarComponent::listen/event:', event);
    // Listen for incoming messages
    this.svSioTest.sioListen(event).subscribe({
      next: (payLoad: ICdPushEnvelop) => {
        // console.log('cd-shell/SidebarComponent::listen/Received payLoad:', payLoadStr);
        // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
        console.log('SidebarComponent::pushSubscribe()/payLoad:', payLoad);
        // Handle the message payload
        switch (payLoad.pushData.emittEvent) {
          case 'push-msg-relayed':
            console.log('cd-shell/SidebarComponent::listen()/push-msg-relayed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/SidebarComponent::listen()/push-msg-relayed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-msg-relayed event")
            this.updateRelayed(payLoad)
            break;
          case 'push-msg-pushed':
            console.log('cd-shell/SidebarComponent::listen()/push-msg-pushed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/SidebarComponent::listen()/push-msg-pushed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-msg-pushed event")
            this.notificationAcceptDelivery(payLoad)
            break;
          case 'push-delivered':
            console.log('cd-shell/SidebarComponent::listen()/push-delivered/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/SidebarComponent::listen()/push-delivered/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-delivered-client event")
            this.notificationMsgComplete(payLoad)
            break;

          case 'push-registered-client':
            console.log('cd-shell/SidebarComponent::listen()/push-registered-client/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/SidebarComponent::listen()/push-registered-client/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-registered-client event")
            this.saveSocket(payLoad);
            break;

          case 'msg-relayed':
            console.log('cd-shell/SidebarComponent::listen()/msg-relayed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/SidebarComponent::listen()/msg-relayed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle msg-relayed event")
            break;
          case 'push-menu':
            console.log('cd-shell/SidebarComponent::listen()/push-menu/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/SidebarComponent::listen()/push-menu/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log('cd-shell/SidebarComponent::listen()/push-menu/:payLoad:', payLoad)
            console.log("handle push-menu event")
            break;
        }

      },
      error: (error) => {
        console.error('cd-shell/SidebarComponent::listen/Error receiving message:', error);
      },
      complete: () => {
        console.log('cd-shell/SidebarComponent::listen/Message subscription complete');
      }
    })
  }

  notificationAcceptDelivery(payLoad: ICdPushEnvelop) {
    console.log('cd-shell::SidebarComponent::notificationAcceptDelivery()/01')
    console.log('cd-shell::SidebarComponent::notificationAcceptDelivery()/senderAcceptDelivery1:', payLoad)
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.deliveryTime = Number(new Date());
    payLoad.pushData.commTrack.delivered = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = 'msg-received';
    payLoad.pushData.emittEvent = 'push-delivered';

    // make use of delivered data
    this.htmlMenu(payLoad.pushData.m, payLoad.pushData.token)
    /**
     * reverse sender and receiver subTypeId
     */
    console.log('cd-shell::SidebarComponent::notificationAcceptDelivery()/senderAcceptDelivery2:', payLoad)
    // this.sendPayLoad(payLoad);
    this.sendSioMessage(payLoad)
  }

  notificationMsgComplete(payLoad: ICdPushEnvelop) {
    console.log('cd-shell::SidebarComponent::notificationMsgComplete()/01')
    console.log('cd-shell::SidebarComponent::notificationMsgComplete()/1:', payLoad)
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.completedTime = Number(new Date());
    payLoad.pushData.commTrack.completed = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = 'msg-completed'
    console.log('cd-shell::SidebarComponent::notificationMsgComplete/2:', payLoad)
    /**
     * reverse sender and receiver subTypeId
     */
    // this.sendPayLoad(payLoad);
    this.sendSioMessage(payLoad)
  }

  sendSioMessage(envl: ICdPushEnvelop): void {
    this.logger.info('cd-shell/SidebarComponent::sendSioMessage/envl.pushData.triggerEvent:', envl.pushData.triggerEvent);
    this.logger.info('cd-shell/SidebarComponent::sendSioMessage/envl:', envl);
    this.svSioTest.sendMessage(envl.pushData.triggerEvent, envl).subscribe({
      next: (response: boolean) => {
        console.log('Message sent successfully:', response);
      },
      error: (error) => {
        console.error('Error sending message:', error);
      },
      complete: () => {
        console.log('Message sending complete');
      }
    });
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
        this.htmlMenu(menuData, '');
      })
  }

  /**
   * No action is expected from sender.
   * No message to send to server
   * Optionally, the sender can do its own house
   * data updates and records.
   * @param payLoad 
   */
  updateRelayed(payLoad: ICdPushEnvelop) {
    console.log('updateRelayed()/01')
    console.log('updateRelayed()/payLoad:', payLoad)
    /**
     * update record of send messages
     */
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
        console.log('SidebarComponent::listen()/push-registered-client/:payLoadStr:', payLoadStr)
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          console.log('SidebarComponent::pushSubscribe()/payLoad:', payLoad);
          this.saveSocket(payLoad);
        }
      })

    cls.listenSecure('push-menu')
      .subscribe((payLoadStr: string) => {
        console.log('SidebarComponent::listen()/push-menu/:payLoadStr:', payLoadStr)
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          console.log('SidebarComponent::pushSubscribe()/payLoad:', payLoad);
          // start idletimeout
          this.routParams.queryParams.token = payLoad.pushData.token;
          this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
          // load menu
          const menuData = JSON.parse(payLoad.pushData.m);
          if (menuData) {
            this.htmlMenu(JSON.parse(payLoad.pushData.m), payLoad.pushData.token);
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

  socketAction(cls, emittEvent, payLoad) {
    console.log("SidebarComponent::socketAction()/01")
    console.log("SidebarComponent::socketAction()/payLoad:", payLoad)
    console.log("SidebarComponent::socketAction()/emittEvent:", emittEvent)
    if (emittEvent == 'push-registered-client') {
      cls.onPushRegisteredClient(cls, payLoad)
    }
    if (emittEvent === 'push-msg-pushed') {
      cls.onPushMsgPushed(cls, payLoad)
    }
  }

  onPushRegisteredClient(cls: any, payLoadStr) {
    console.log('SidebarComponent::onPushRegisteredClient():payLoadStr:', payLoadStr)
    if (payLoadStr) {
      // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
      // console.log('SidebarComponent::pushSubscribe()/payLoad:', payLoad);
      cls.saveSocket(payLoadStr);
    }
  }

  onPushMsgPushed(cls: any, payLoad) {
    console.log('SidebarComponent::onPushMsgPushed():payLoad:', payLoad)
    if (payLoad) {
      console.log('SidebarComponent::onPushMsgPushed()/push-menu/:payLoad:', payLoad)
      if (payLoad) {
        // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
        // const payLoad: ICdPushEnvelop = payLoadStr
        console.log('SidebarComponent::onPushMsgPushed()/payLoad:', payLoad);
        // start idletimeout
        cls.routParams.queryParams.token = payLoad.pushData.token;
        cls.svIdleTimeout.startTimer(cls.cd, idleTimerOptions);
        // load menu
        const menuData = payLoad.pushData.m;
        if (menuData) {
          cls.htmlMenu(payLoad.pushData.m);
        }
      }
    }
  }

  /**
   * Send pusher message
   */
  // sendMessage() {
  //   this.newMessage = 'Hello pusher'
  //   this.svPusher.sendMessage('my-channel', 'my-event', this.newMessage)
  //     .subscribe(() => {
  //       console.log('Pusher message sent');
  //       this.newMessage = '';
  //     }, error => {
  //       console.error('Error sending message', error);
  //     });
  // }

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

  async htmlMenu(menuData: MenuItem[], cdToken: string) {
    this.routParams.queryParams.token = cdToken;
    menuData = await this.svMenu.mapMenu(menuData)
    console.log('starting cdShellV2::SidebarComponent/htmlMenu()')
    this.toggleEvents = [];
    console.log('cdShellV2::SidebarComponent/htmlMenu()/01')
    console.log('cdShellV2::SidebarComponent/htmlMenu()/menuData:', menuData)
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
    console.log('cdShellV2::SidebarComponent/htmlRootMenu()/01')
    // append root container
    $.append(h)
      .then(async (success) => {
        // build root menus
        let rootMenus = '';
        // if(menuData){
        //   menuData = [];
        // }
        menuData.forEach((mi: MenuItem) => {
          console.log('cdShellV2::SidebarComponent/htmlRootMenu()/02')
          console.log('cdShellV2::SidebarComponent/htmlRootMenu()/mi:', mi)
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
            console.log('cdShellV2::SidebarComponent/htmlRootMenu()/03')
            console.log('cdShellV2::SidebarComponent/htmlRootMenu()/menuData:', menuData)
            // for each menu item, set children
            menuData.forEach(async (mi: MenuItem) => {
              console.log('cdShellV2::SidebarComponent/htmlRootMenu()/04')
              console.log('cdShellV2::SidebarComponent/htmlRootMenu()/menuData:', menuData)
              console.log('cdShellV2::SidebarComponent/htmlRootMenu()/mi:', mi)
              this.htmlChildren(mi, menuData)
            });
          })
      })
  }

  async htmlChildren(mi: MenuItem, parentData: MenuItem[]) {
    console.log('cdShellV2::SidebarComponent/htmlChildren()/01')
    console.log('cdShellV2::SidebarComponent/htmlChildren()/01/mi:', mi)
    let h: HtmlCtx = {
      elementRef: this.elementRef,
      selector: `#li_${mi.id}`,
      srtHtml: await this.htmlMenuContainer('subMenu', mi),
      position: 'beforeend'
    };
    // set subMenu container
    await $.append(h)
      .then(async (success) => {
        console.log('cdShellV2::SidebarComponent/htmlChildren()/02')
        console.log('cdShellV2::SidebarComponent/htmlChildren()/02/mi:', mi)
        // set children html
        let htmlSubMenu = '';
        mi.subItems.forEach((sm) => {
          console.log('cdShellV2::SidebarComponent/htmlChildren()/03')
          console.log('cdShellV2::SidebarComponent/htmlChildren()/03/sm:', sm)
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
          console.log('cdShellV2::SidebarComponent/htmlChildren()/04')
          console.log('cdShellV2::SidebarComponent/htmlChildren()/parentData:', parentData)
          this.activateDropdown(parentData);
          mi.subItems.forEach((sm) => {
            console.log('cdShellV2::SidebarComponent/htmlChildren()/05')
            console.log('cdShellV2::SidebarComponent/htmlChildren()/sm:', sm)
            this.setRoutTarget(sm);
          });
        });
      })

  }

  activateDropdown(parentData: MenuItem[]) {
    console.log('SidebarComponent::activateDropdown()/01')
    console.log('SidebarComponent::activateDropdown()/parentData:', parentData)
    parentData.forEach((mi: MenuItem) => {
      console.log('SidebarComponent::activateDropdown()/02')
      const parentElem = document.getElementById(`a_${mi.id?.toString()}`) as HTMLElement;
      if (parentElem) {
        console.log('SidebarComponent::activateDropdown()/03')
        console.log('SidebarComponent::activateDropdown()/mi.id:', mi.id)
        if (!this.isRepeatedEvent(mi.id!)) {
          console.log('SidebarComponent::activateDropdown()/04')
          console.log('SidebarComponent::activateDropdown()/mi.id:', mi.id)
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

  ngOnDestroy() {
    this.svPusher.unsubscribe('my-channel');
  }

}
