import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from "socket.io-client";
import { CdObjId, ICdPushEnvelop, ICdResponse } from '@corpdesk/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SioClientService {
  jwtToken = '';
  socket: any = null;
  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  pushDataList: ICdPushEnvelop[] = [];
  constructor(

  ) {
    this.socket = io(environment.sioEndpoint,environment.apiOptions);
  }
  /**
   * - save resource in localStorag so it is sharable
   * with other resources between different client entities
   * - make call to the server to
   *    - save resource in redis for reference by other remote clients
   *    - the same records in redis will be reverenced for persistent socket connection
   */
  registerResource(rGuid: string) {
    // this.resourceGuid = uuidv4();
    const key = rGuid;
    const value: CdObjId = {
      appId: environment.appId,
      ngModule: 'UserModule',
      resourceName: 'SessionService',
      resourceGuid: rGuid,
      jwtToken: '',
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

  initSio(rGuid: string) {
    // this.registerResource(rGuid)
    console.log('SidebarComponent::initWebSocket()/01')

    /**
     * Send receives 'push-msg-relayed' event when
     * message has been received by server and pushed 
     * to client. No action is expected from the sender
     * listen for notification that a given message has reached the server
     * and ready for pushing
     */
    this.listenSecure('push-msg-relayed')
      .subscribe((payLoadStr: string) => {
        console.log('listenSecure()/push-msg-relayed/:payLoadStr:', payLoadStr)
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          console.log('listenSecure(msg-relayed)payLoad:', payLoad)
          this.updateRelayed(payLoad)
        }
      })

    /**
   * Recepient waits for notification of messaged pushed
   */
    this.listenSecure('push-msg-pushed')
      .subscribe((payLoadStr: string) => {
        console.log('listenSecure()/push-delivered/:payLoadStr:', payLoadStr)
        // this confirms a given message was received
        // mark local send message as delivered
        // this.messageList.push(message);
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          // sender to flag that sent message is received
          this.notificationAcceptDelivery(payLoad)
        }
      })



    /**
     * Sender waits for notification to message delivered
     * It responds by sending completion message to server.
     * Server is to save records but no further action
     * Server would mark the commTrack as completed
     * listening by r for notification that a given message
     * has been seccussfully delivered
     */
    this.listenSecure('push-delivered')
      .subscribe((payLoadStr: string) => {
        console.log('listenSecure()/push-delivered/:payLoadStr:', payLoadStr)
        // this confirms a given message was received
        // mark local send message as delivered
        // this.messageList.push(message);
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          // sender to flag that sent message is received
          this.notificationMsgComplete(payLoad)
        }
      })

  }

  public sendMessage(msg: string) {
    console.log('sendMessage()/msg', msg)
    this.socket.emit('message', msg);
  }

  public sendPayLoad(pushEnvelope: ICdPushEnvelop) {
    console.log('SioService::sendPayLoad/01/pushEnvelope:', pushEnvelope)
    if ('pushData' in pushEnvelope) {
      if ('pushGuid' in pushEnvelope.pushData) {
        console.log('SioService::sendPayLoad/02/pushEnvelope:')
        // every message has a unique id
        // pushEnvelope.pushData.pushGuid = uuidv4();
        const msg = JSON.stringify(pushEnvelope);
        this.socket.emit(pushEnvelope.pushData.triggerEvent, msg);
      } else {
        console.log('triggerEvent missing in payLoad.pushData')
      }
    } else {
      console.log('pushData missing in pushEnvelope')
    }

  }

  public listenSecure = (emittEvent: string) => {
    console.log('listenSecure()/emittEvent/01', emittEvent)
    this.socket.on(emittEvent, (payLoadStr: any) => {

      /**
       * - check if confirmation process is enabled
       * - prepare confirmation message back to sender
       *    - flag message as recieved
       *    - set triggerEvent event to 'msg-delivered' for server processing
       *    - set emittEvent event to 'msg-delivered' for server processing
       *    - trim (remove unessary load) payload for confirmation message
       * - send confirmation message to sender
       */
      let triggerEvent = null;
      if (payLoadStr) {
        console.log('listenSecure()/emittEvent/01/emittEvent:', emittEvent)
        console.log('listenSecure()/payLoadStr:', payLoadStr)
        const payLoad: ICdPushEnvelop = payLoadStr;
        if ('pushData' in payLoad) {
          console.log('SioService::listenSecure/2')
          if ('triggerEvent' in payLoad.pushData) {
            console.log('SioService::listenSecure/3')
            triggerEvent = payLoad.pushData.triggerEvent;
          } else {
            console.log('triggerEvent missing in payLoad.pushData')
          }
        } else {
          console.log('pushData missing in payLoad')
        }


        /**
         * 
         * if emittEvent === 'msg-delivered-push', 
         * it means end of cycle of messaging, no need to 
         * send another confirmation message, so...
         *    - do not send confirmation message
         *    - 
         */
        console.log('SioService::listenSecure/4')
        console.log('listenSecure()/emittEvent/04/emittEvent:', emittEvent)
        if (emittEvent === 'push-msg-relayed') {
          /**
           * proceed with normal message reception,
           * do not send another emittEvent = 'msg-delivered-push'
           */
          console.log('SioService::listenSecure/5')
          // this.message$.next(payLoadStr);
        } else {
          /**
           * send confirmation massage
           *  - set triggerEvent = 'msg-delivered'
           *  - set emittEvent = 'msg-delivered-push'
           */
          console.log('SioService::listenSecure/6')
          if (emittEvent === 'push-msg-relayed') {

          }
          // else {
          //   this.sendPayLoad(payLoad)
          // }
          if (emittEvent === 'push-msg-pushed') {
            this.notificationAcceptDelivery(payLoadStr)
          }

          if (emittEvent === 'push-delivered') {
            this.notificationMsgComplete(payLoadStr)
          }

        }
      }

    });
    return this.message$.asObservable();
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

  notificationAcceptDelivery(payLoad: ICdPushEnvelop) {
    console.log('senderAcceptDelivery()/01')
    console.log('senderAcceptDelivery()/senderAcceptDelivery:', payLoad)
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
    /**
     * reverse sender and receiver subTypeId
     */
    this.sendPayLoad(payLoad);
  }

  notificationMsgComplete(payLoad: ICdPushEnvelop) {
    console.log('senderAcceptDelivery()/01')
    console.log('senderAcceptDelivery()/senderAcceptDelivery1:', payLoad)
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
    console.log('senderAcceptDelivery()/senderAcceptDelivery2:', payLoad)
    /**
     * reverse sender and receiver subTypeId
     */
    this.sendPayLoad(payLoad);
  }
}