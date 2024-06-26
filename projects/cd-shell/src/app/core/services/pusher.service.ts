import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Pusher from 'pusher-js';
import { environment } from 'projects/cd-shell/src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PusherService {
    public pusher: Pusher;
    private channel: any;
    httpOptions = environment.apiOptions;

    constructor(
        private http: HttpClient,
    ) {

        this.initPusher();

        // const watchlistEventHandler = (event) => {
        //     console.log("event.userIds:", event.user_ids)
        //     console.log("event.name:", event.name)

        // };
        // this.pusher.user.watchlist.bind('online', watchlistEventHandler);
        // this.pusher.user.watchlist.bind('offline', watchlistEventHandler);
    }

    initPusher() {
        /**
         * Pusher Options:
         * {
                cluster: 'APP_CLUSTER',
                forceTLS: true,
                userAuthentication: {
                    params: {
                    param1: 'value1',
                    param2: 'value2'
                    },
                    headers: {
                    header1: 'value1',
                    header2: 'value2'
                    }
                }
                channelAuthorization: {
                    params: {
                    param1: 'value1',
                    param2: 'value2'
                    },
                    headers: {
                    header1: 'value1',
                    header2: 'value2'
                    }
                }
            }
         */
        // this.pusher.x
        // Pusher.Runtime.createXHR = function () {
        //     var xhr = new XMLHttpRequest()
        //     xhr.withCredentials = true
        //     return xhr
        // }

        this.pusher = new Pusher(environment.pushConfig.pusher.apiKey, environment.pushConfig.pusher.options);

        // this.pusher.signin();
    }

    subscribe(channelName: string, eventName: string, callback: (data: any) => void) {
        this.channel = this.pusher.subscribe(channelName);
        this.channel.bind(eventName, callback);
    }

    unsubscribe(channelName: string) {
        this.pusher.unsubscribe(channelName);
    }

    sendMessage(channel: string, event: string, message: string): Observable<any> {
        const ep = `${environment.sioHost}:${environment.SOCKET_IO_PORT}/notify`
        console.log("sendMessage()/ep:", ep)
        return this.http.post('https://cd-api.co.ke:3002/notify', { message, channel, event });
    }

    // sendMessage2(user: string, text: string) {
    //     const message: Message = {
    //         user: user,
    //         text: text,
    //     }
    //     this.pusher.channel.trigger('client-new-message', message);
    //     this.messages.push(message);
    // }

    

    newChannel(channelName) {
        return this.pusher.channel(channelName);
    }
}
