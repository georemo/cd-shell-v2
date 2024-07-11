import { v4 as uuidv4 } from 'uuid';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import {
  UserService, AuthData, SessService, MenuService, NavService, SioClientService, WebsocketService, ICommConversationSub,
  BaseModel, IAppState, CdObjId, BaseService, LsFilter, StorageType, ICdPushEnvelop, ISocketItem,
  User
} from '@corpdesk/core';
import { environment } from '../../../../environments/environment';
import { SioClientTestService } from '../../../core/services/sio-client-test.service';
// import { SioClientService } from '../../../core/services/sio-client.service';
interface IInitData {
  key: string;
  value: CdObjId;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  // providers:[UserService],
})

export class HomeComponent implements OnInit {
  debug = true;
  baseModel: BaseModel;
  resourceGuid = uuidv4();
  jwtWsToken: null;
  homeInvalid = false;
  rememberMe = true;
  submitted = false;
  fg: FormGroup;
  postData: any;
  errMsg: any;
  error = '';
  sidebarInitData: IInitData;
  socketData: ISocketItem[] | null = [];

  ////////////////////////////////////////////
  header = "Welcome!"
  subheader = "Sign in to continue to ASDAP"
  key: string;
  sid: string;
  uid: string;
  newUser: User;

  ///////////////
  routParams = {
    queryParams: { token: '' },
    skipLocationChange: true,
    replaceUrl: false
  };

  urlLogin = "/user/login"
  urlRegister = "/user/register"

  constructor(
    private logger: NGXLogger,
    private svSio: SioClientService,
    private svWss: WebsocketService,
    private svUser: UserService,
    private svSess: SessService,
    private svMenu: MenuService,
    private svNav: NavService,
    private route: Router,
    private aRoute: ActivatedRoute,
    private svBase: BaseService,
    private svSioTest: SioClientTestService,
  ) {
    this.svSio.env = environment;
    this.svSio.initSio(null, null);
    this.fg = new FormGroup({
      userName: new FormControl(),
      password: new FormControl(),
      rememberMe: new FormControl()
    });
  }

  ngOnInit() {
    this.logger.info('cd-shell/HomeComponent::ngOnInit()/StorageType.CdObjId:', StorageType.CdObjId);
    this.initialize();
    this.aRoute.queryParams.subscribe(params => {
      this.key = params['key'];
      this.sid = params['sid'];
      this.uid = params['uid'];

      // Use these parameters as needed, e.g., send them to your backend to verify the user
      console.log(this.key, this.sid, this.uid);

      // Example usage: Confirm data with backend
      this.setHeader();
    });

    // this.logger.debug('AppComponent initialized');

    const filter: LsFilter = {
      storageType: StorageType.CdObjId,
      cdObjId: {
        appId: localStorage.getItem('appId'),
        resourceGuid: null,
        resourceName: 'SidebarComponent',
        ngModule: 'SharedModule',
        jwtToken: localStorage.getItem('accessToken'),
        socket: null,
        commTrack: null
      }
    }
    this.logger.info('cd-shell/HomeComponent::ngOnInit()/filter:', filter);
    // this.sidebarInitData = this.svBase.searchLocalStorage(filter);
    this.sidebarInitData = this.searchLocalStorage(filter);
    this.logger.info('cd-shell/HomeComponent::ngOnInit()/this.sidebarInitData:', this.sidebarInitData);
    const socketDataStr = localStorage.getItem('socketData')
    if (socketDataStr) {
      this.socketData = JSON.parse(socketDataStr).filter(appInit)
      function appInit(s: ISocketItem): ISocketItem | null {
        if (s.name === 'appInit') {
          return s;
        } else {
          return null;
        }
      }
      this.logger.info('cd-shell/HomeComponent::ngOnInit()/this.socketData:', this.socketData);
    } else {
      this.logger.info('Err: socket data is not valid')
    }

  }

  /**
   * Initialize
   */
  initialize(): void {
    const filter: LsFilter = {
      storageType: StorageType.CdObjId,
      cdObjId: {
        appId: localStorage.getItem('appId'),
        resourceGuid: null,
        resourceName: 'HomeComponent',
        ngModule: 'SharedModule',
        jwtToken: localStorage.getItem('accessToken'),
        socket: null,
        commTrack: null
      }
    }
    this.logger.info('cd-shell/HomeComponent::ngOnInit()/filter:', filter);
    // this.sidebarInitData = this.svBase.searchLocalStorage(filter);
    this.sidebarInitData = this.searchLocalStorage(filter);
    this.logger.info('cd-shell/HomeComponent::ngOnInit()/this.sidebarInitData:', this.sidebarInitData);
    const socketDataStr = localStorage.getItem('socketData')
    if (socketDataStr) {
      this.socketData = JSON.parse(socketDataStr).filter(appInit)
      function appInit(s: ISocketItem): ISocketItem | null {
        if (s.name === 'appInit') {
          return s;
        } else {
          return null;
        }
      }
      this.logger.info('cd-shell/HomeComponent::ngOnInit()/this.socketData:', this.socketData);
    } else {
      this.logger.info('Err: socket data is not valid')
    }
    this.setAppId();
  }

  async setAppId() {
    console.log('cd-shell/HomeComponent::setAppId()/01')
    console.log('cd-shell/HomeComponent::setAppId()/this.svSio.socket:', this.svSio.socket)
    localStorage.removeItem('appId');
    // localStorage.setItem('appId', this.svBase.getGuid());
    const appId = localStorage.getItem('appId');
    console.log('cd-shell/HomeComponent::setAppId()/appId:', appId)
    const envl: ICdPushEnvelop = await this.configPushPayload('register-client', 'push-registered-client', 1000)
    console.log('cd-shell/HomeComponent::setAppId()/envl:', envl)
    // this.svSio.sendPayLoad(envl)
    this.listen('push-registered-client')
    this.listen('msg-relayed')
    this.listen('push-msg-relayed')
    this.listen('push-menu')
    this.sendSioMessage(envl.pushData.triggerEvent, envl)
  }

  listen(event) {
    this.logger.info('cd-shell/cd-shell/HomeComponent::listen/event:', event);
    // Listen for incoming messages
    this.svSioTest.sioListen(event).subscribe({
      next: (payLoad: ICdPushEnvelop) => {
        // console.log('cd-shell/cd-shell/HomeComponent::listen/Received payLoad:', payLoadStr);
        // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
        console.log('cd-shell/HomeComponent::pushSubscribe()/payLoad:', payLoad);
        // Handle the message payload
        switch (payLoad.pushData.emittEvent) {
          case 'push-registered-client':
            console.log('cd-shell/HomeComponent::listenSecure()/push-registered-client/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/HomeComponent::listenSecure()/push-registered-client/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-registered-client event")
            this.saveSocket(payLoad);
            break;
          case 'push-msg-relayed':
            console.log('cd-shell/HomeComponent::listenSecure()/push-msg-relayed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/HomeComponent::listenSecure()/push-msg-relayed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-msg-relayed event")
            this.updateRelayed(payLoad)
            break;
          case 'msg-relayed':
            console.log('cd-shell/HomeComponent::listenSecure()/msg-relayed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/HomeComponent::listenSecure()/msg-relayed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle msg-relayed event")
            break;
          case 'push-menu':
            console.log('cd-shell/HomeComponent::listenSecure()/push-menu/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-shell/HomeComponent::listenSecure()/push-menu/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log('cd-shell/HomeComponent::listenSecure()/push-menu/:payLoad:', payLoad)
            console.log("handle push-menu event")
            this.routParams.queryParams.token = payLoad.pushData.token;
            // this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
            // load appropriate menu
            // this.htmlMenu(payLoad.resp.data,payLoad.pushData.token);
            break;
        }

      },
      error: (error) => {
        console.error('cd-shell/cd-shell/HomeComponent::listen/Error receiving message:', error);
      },
      complete: () => {
        console.log('cd-shell/cd-shell/HomeComponent::listen/Message subscription complete');
      }
    })
  }

  sendSioMessage(triggerEvent: string, envl: any): void {
    this.logger.info('cd-shell/HomeComponent::sendSioMessage/triggerEvent:', triggerEvent);
    this.logger.info('cd-shell/HomeComponent::sendSioMessage/envl:', envl);
    this.svSioTest.sendMessage(triggerEvent, envl).subscribe({
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

  setHeader(): void {
    console.log('starting HomeService::setHeader()');
    if (this.key && this.uid && this.sid) {
      const reqQuery = {
        query: {
          where: {
            userId: this.uid,
            activationKey: this.key
          }
        }
      }
      this.svUser.getUser$(reqQuery, this.sid)
        .subscribe((res: any) => {
          console.log('HomeService::setHeader()/subscribe/res:', res);
          // console.log('HomeService::setHeader()/subscribe/res.data:', res.data);
          // console.log('HomeService::setHeader()/subscribe/res.data:', res.data.length);
          if (res.data.length > 0) {
            this.header = `Congratulations ${res.data[0].userName}, your account is now active.`
          }
        });
    } else {
      this.header = "Welcome!"
    }


  }

  home(fg: any) {
    this.logger.info('starting cd-shell/HomeComponent::home');
    let authData: AuthData = fg.value;
    const valid = fg.valid;
    this.logger.info('cd-shell/HomeComponent::home/01');
    this.logger.info('cd-shell/HomeComponent::home/fg:', fg);
    this.logger.info('cd-shell/HomeComponent::home/valid:', valid);
    this.submitted = true;
    const consumerGuid = { consumerGuid: environment.consumerToken };
    authData = Object.assign({}, authData, consumerGuid); // merge data with consumer object
    try {
      this.logger.info('cd-shell/HomeComponent::home/02');
      if (valid) {
        this.logger.info('cd-shell/HomeComponent::home/03');
        this.initSession(authData);
      }
    } catch (err) {
      this.logger.info('cd-shell/HomeComponent::home/04');
      this.errMsg = "Something went wrong!!"
      this.homeInvalid = true;
    }
  }

  initSession(authData: AuthData) {
    this.logger.info('cd-shell/HomeComponent::initSession/01');
    this.svUser.auth$(authData).subscribe((res: any) => {
      if (res.app_state.success === true) {
        this.logger.info('cd-shell/HomeComponent::initSession/res:', JSON.stringify(res));
        this.svSess.appState = res.app_state;
        /*
        create a session on successfull authentication.
        For subsequeng successull request to the server,
        use renewSess(res);
        */
        if (res.app_state.sess.cd_token !== null && res.app_state.success) {
          this.logger.info('cd-shell/HomeComponent::initSession/02');
          const envl: ICdPushEnvelop = this.configPushPayload('home', 'push-menu', res.data.userData.userId)
          envl.pushData.m = res.data.menuData;
          this.logger.info('cd-shell/HomeComponent::initSession/envl:', envl);

          if (environment.wsMode === 'sio') {
            this.logger.info('cd-shell/HomeComponent::initSession/envl:...using sio');
            this.svSio.sendPayLoad(envl)
          }

          if (environment.wsMode === 'wss') {
            this.logger.info('cd-shell/HomeComponent::initSession/envl:...using wss');
            this.svWss.sendMsg(envl)
          }

          ///////////////////////////////////////
          this.svSess.createSess(res, this.svMenu);
          this.svUser.currentUser = { name: `${res.data.userData.userName}`, picture: `${environment.shellHost}/user-resources/${res.data.userData.userGuid}/avatar-01/a.jpg` };
          this.svNav.userMenu = [
            { title: 'Profile', link: '/pages/cd-auth/register' },
            { title: 'Log out', link: '/pages/cd-auth/logout' }
          ];
          // this.baseModel.sess = res.app_state.sess;
          const params = {
            queryParams: { token: res.app_state.sess.cd_token },
            skipLocationChange: true,
            replaceUrl: false
          };
          // below: old method
          // this.route.navigate(['/comm'], params);
          // this.route.navigate(['/dashboard'], params);
          this.route.navigate([environment.initialPage], params);


          // below new method based on this.baseModel;
          // this.svNav.nsNavigate(this,'/comm','message from cd-user')
        }
      } else {
        this.errMsg = "The userName and password were not valid"
        this.homeInvalid = true;
        this.svSess.logout();
      }
    });

  }

  configPushPayload(triggerEvent: string, emittEvent: string, cuid: number | string): ICdPushEnvelop {
    console.log('starting cd-user::HomeComponent::configPushPayload()');
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
        appSockets: this.socketData,
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

    console.log('cd-user::HomeComponent::configPushPayload()/this.resourceGuid:', this.resourceGuid);
    const key = this.resourceGuid;
    const cdObj: CdObjId = {
      appId: localStorage.getItem('appId')!,
      ngModule: 'UserFrontModule',
      resourceName: 'HomeComponent',
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


    // set recepient
    // this.logger.info('cd-user/HomeComponent::configPushPayload()/this.sidebarInitData:', JSON.stringify(this.sidebarInitData));
    // this.logger.info('cd-user/HomeComponent::configPushPayload()/this.sidebarInitData.value:', JSON.stringify(this.sidebarInitData.value));
    const uRecepient: any = { ...users[0] }
    uRecepient.subTypeId = 7;
    this.logger.info('cd-user/HomeComponent::configPushPayload()/uRecepient:', JSON.stringify(uRecepient));
    uRecepient.cdObjId = this.sidebarInitData.value
    envl.pushData.pushRecepients.push(uRecepient)

    this.logger.info('cd-user/HomeComponent::configPushPayload()/envl:', JSON.stringify(envl));

    return envl;

  }

  // configPushPayload(triggerEvent: string, emittEvent: string, cuid: number): ICdPushEnvelop {
  //   this.logger.info('starting cd-user/HomeComponent::configPushPayload()');
  //   const pushEnvelope: ICdPushEnvelop = {
  //     pushData: {
  //       pushGuid: '',
  //       m: '',
  //       pushRecepients: [],
  //       triggerEvent: '',
  //       emittEvent: '',
  //       token: '',
  //       isNotification: null,
  //       appSockets: this.socketData,
  //       commTrack: {
  //         initTime: Number(new Date()),
  //         relayTime: null,
  //         relayed: false,
  //         pushed: false,
  //         pushTime: null,
  //         deliveryTime: null,
  //         delivered: false,
  //         completed: false,
  //         completedTime: null
  //       },
  //     },
  //     req: null,
  //     resp: null
  //   }

  //   const users: ICommConversationSub[] = [
  //     {
  //       userId: cuid,
  //       subTypeId: 1,
  //       cdObjId: {
  //         appId: environment.appId,
  //         ngModule: 'UserFrontModule',
  //         resourceName: 'HomeComponent',
  //         resourceGuid: uuidv4(),
  //         jwtToken: '',
  //         socket: null,
  //         socketId: '',
  //         commTrack: {
  //           initTime: Number(new Date()),
  //           relayTime: null,
  //           relayed: false,
  //           pushed: false,
  //           pushTime: null,
  //           deliveryTime: null,
  //           delivered: false,
  //           completed: false,
  //           completedTime: null
  //         },
  //       },
  //     },
  //   ]

  //   /**
  //    * - search socketStore for item with name='appInit'
  //    * - confirm there is no double entry
  //    * - save the above socket data in the socketStore of the envelop
  //    * - this will be used in the push server to push menu data
  //    */

  //   const envl: ICdPushEnvelop = { ...pushEnvelope };
  //   envl.pushData.triggerEvent = triggerEvent;
  //   envl.pushData.emittEvent = emittEvent;

  //   // set sender
  //   const uSender: ICommConversationSub = { ...users[0] }
  //   uSender.subTypeId = 1;
  //   envl.pushData.pushRecepients.push(uSender)


  //   // set recepient
  //   // this.logger.info('cd-user/HomeComponent::configPushPayload()/this.sidebarInitData:', JSON.stringify(this.sidebarInitData));
  //   // this.logger.info('cd-user/HomeComponent::configPushPayload()/this.sidebarInitData.value:', JSON.stringify(this.sidebarInitData.value));
  //   const uRecepient: ICommConversationSub = { ...users[0] }
  //   uRecepient.subTypeId = 7;
  //   this.logger.info('cd-user/HomeComponent::configPushPayload()/uRecepient:', JSON.stringify(uRecepient));
  //   uRecepient.cdObjId = this.sidebarInitData.value
  //   envl.pushData.pushRecepients.push(uRecepient)

  //   this.logger.info('cd-user/HomeComponent::configPushPayload()/envl:', JSON.stringify(envl));

  //   return envl;

  // }

  // configPushPayload(triggerEvent: string, emittEvent: string, cuid: number): ICdPushEnvelop {
  //   this.logger.info('starting cd-shell/HomeComponent::configPushPayload()');
  //   const pushEnvelope: ICdPushEnvelop = {
  //     pushData: {
  //       pushGuid: '',
  //       m: '',
  //       pushRecepients: [],
  //       triggerEvent: '',
  //       emittEvent: '',
  //       token: '',
  //       isNotification: null,
  //       appSockets: this.socketData,
  //       commTrack: {
  //         initTime: Number(new Date()),
  //         relayTime: null,
  //         relayed: false,
  //         pushed: false,
  //         pushTime: null,
  //         deliveryTime: null,
  //         delivered: false,
  //         completed: false,
  //         completedTime: null
  //       },
  //     },
  //     req: null,
  //     resp: null
  //   }

  //   const users: ICommConversationSub[] = [
  //     {
  //       userId: cuid,
  //       subTypeId: 1,
  //       cdObjId: {
  //         appId: environment.appId,
  //         ngModule: 'UserFrontModule',
  //         resourceName: 'HomeComponent',
  //         resourceGuid: uuidv4(),
  //         jwtToken: '',
  //         socket: null,
  //         socketId: '',
  //         commTrack: {
  //           initTime: Number(new Date()),
  //           relayTime: null,
  //           relayed: false,
  //           pushed: false,
  //           pushTime: null,
  //           deliveryTime: null,
  //           delivered: false,
  //           completed: false,
  //           completedTime: null
  //         },
  //       },
  //     },
  //   ]

  //   /**
  //    * - search socketStore for item with name='appInit'
  //    * - confirm there is no double entry
  //    * - save the above socket data in the socketStore of the envelop
  //    * - this will be used in the push server to push menu data
  //    */

  //   const envl: ICdPushEnvelop = { ...pushEnvelope };
  //   envl.pushData.triggerEvent = triggerEvent;
  //   envl.pushData.emittEvent = emittEvent;

  //   // set sender
  //   const uSender: ICommConversationSub = { ...users[0] }
  //   uSender.subTypeId = 1;
  //   envl.pushData.pushRecepients.push(uSender)


  //   // set recepient
  //   this.logger.info('cd-shell/HomeComponent::configPushPayload()/this.sidebarInitData:', JSON.stringify(this.sidebarInitData));
  //   this.logger.info('cd-shell/HomeComponent::configPushPayload()/this.sidebarInitData.value:', JSON.stringify(this.sidebarInitData.value));
  //   const uRecepient: ICommConversationSub = { ...users[0] }
  //   uRecepient.subTypeId = 7;
  //   this.logger.info('cd-shell/HomeComponent::configPushPayload()/uRecepient:', JSON.stringify(uRecepient));
  //   uRecepient.cdObjId = this.sidebarInitData.value
  //   envl.pushData.pushRecepients.push(uRecepient)

  //   this.logger.info('cd-shell/HomeComponent::configPushPayload()/envl:', JSON.stringify(envl));

  //   return envl;

  // }

  saveSocket(payLoad: ICdPushEnvelop) {
    console.log('cd-shell/HomeComponent::saveSocket()/payLoad:', payLoad);
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

  searchLocalStorage(f: LsFilter) {
    this.logger.info('starting cd-shell/HomeComponent::searchLocalStorage()/lcLength:');
    // const lc = { ...localStorage };
    const lcArr = [];

    const lcLength = localStorage.length;
    this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/lcLength:', lcLength);
    let i = 0;
    for (let i = 0; i < localStorage.length; i++) {
      // try {
      // set iteration key name
      const k = localStorage.key(i);
      // use key name to retrieve the corresponding value
      var v = localStorage.getItem(k!);
      // this.logger.info the iteration key and value
      this.logger.info('Key: ' + k + ', Value: ' + v);
      try {
        this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/1')
        if (typeof (v) === 'object') {
          this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/2')
          this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/v:', v)
          const lcItem = JSON.parse(v!);
          if ('success' in lcItem) {
            this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/3')
            const appState: IAppState = lcItem;
            this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/appState:', appState)
          }
          if ('resourceGuid' in lcItem) {
            this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/4')
            const cdObjId = lcItem;
            this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/cdObjId:', cdObjId)
          }
          this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/5')
          lcArr.push({ key: k, value: JSON.parse(v!) })
        } else {
          this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/typeof (v):', typeof (v))
          this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/6')
          lcArr.push({ key: k, value: JSON.parse(v) })
        }

      } catch (e) {
        this.logger.info('offending item:', v);
        this.logger.info('the item is not an object');
        this.logger.info('Error:', e);
      }

    }
    this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/lcArr:', lcArr);
    this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/f.cdObjId!.resourceName:', f.cdObjId!.resourceName);
    // isAppState
    // const resourceName = 'UserModule';
    const AppStateItems = (d: any) => 'success' in d.value;
    const isObject = (d: any) => typeof (d.value) === 'object';
    const CdObjIdItems = (d: any) => 'resourceName' in d.value;
    const filtObjName = (d: any) => d.value.resourceName === f.cdObjId!.resourceName && d.value.ngModule === f.cdObjId!.ngModule;
    const latestItem = (prev: any, current: any) => (prev.value.commTrack.initTime > current.value.commTrack.initTime) ? prev : current;
    let ret: any = null;
    try {
      if (this.debug) {
        this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/debug=true:');
        ret = lcArr
          .filter((d: any) => {
            if (typeof (d.value) === 'object') {
              this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/filteredByObject: d:', d);
              return d
            } else {
              return null;
            }
          })
          .filter((d: any) => {
            if ('resourceName' in d.value) {
              this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/filteredByResourceNameField: d:', d);
              return d;
            } else {
              return null;
            }
          })
          .filter((d: any) => {
            this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/filteredByName: d:', d);
            this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/filteredByName: d.value.resourceName:', d.value.resourceName);
            this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/filteredByName: f.cdObjId!.resourceName:', f.cdObjId!.resourceName);
            this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/filteredByName: d.value.ngModule:', d.value.ngModule);
            this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/filteredByName: f.cdObjId!.ngModule:', f.cdObjId!.ngModule);
            if (d.value.resourceName === f.cdObjId!.resourceName && d.value.ngModule === f.cdObjId!.ngModule) {
              return d;
            } else {
              return null;
            }
          })
          .reduce(
            (prev = {}, current = {}) => {
              this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/prev:', prev);
              this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/current:', current);
              return (prev.value.commTrack.initTime > current.value.commTrack.initTime) ? prev : current;
            }
          );
      } else {
        this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/debug=false:');
        ret = lcArr
          .filter(isObject)
          .filter(CdObjIdItems!)
          .filter(filtObjName!)
          .reduce(latestItem!)
      }
      this.logger.info('cd-shell/HomeComponent::searchLocalStorage()/ret:', ret);
    } catch (e) {
      this.logger.info('Error:', e);
    }
    return ret;
  }

  goTo(url){
    const params = {
      queryParams: { token: this.sid },
      skipLocationChange: true,
      replaceUrl: false
    };
    this.route.navigate([url], params);
  }

  onFocus() {
    this.errMsg = "";
  }

}
