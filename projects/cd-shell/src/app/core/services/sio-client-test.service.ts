import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'projects/cd-shell/src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SioClientTestService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.sioEndpoint, environment.sioOptions); // Adjust the URL to your server
  }

  public sendMessage(triggerEvent:string,pushEnvelope: any): Observable<boolean> {
    const msg = JSON.stringify(pushEnvelope);
    return new Observable((observer) => {
      this.socket.emit(triggerEvent, msg, (response: { status: boolean }) => {
        if (response.status) {
          observer.next(true);
        } else {
          observer.error('Message delivery failed');
        }
        observer.complete();
      });
    });
  }

  public listen(emittEvent: string): Observable<string> {
    return new Observable((observer) => {
      this.socket.on(emittEvent, (data: string) => {
        observer.next(data);
      });
    });
  }
}