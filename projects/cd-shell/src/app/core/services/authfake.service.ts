import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })

export class AuthfakeauthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        console.log("AuthfakeauthenticationService::constructor()/01")
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        console.log("AuthfakeauthenticationService::get currentUserValue()/this.currentUserSubject:", this.currentUserSubject)
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        console.log("AuthfakeauthenticationService::login()/01")
        console.log("AuthfakeauthenticationService::login()/email:", email)
        console.log("AuthfakeauthenticationService::login()/password:", password)
        return this.http.post<any>(`/users/authenticate`, { email, password })
            .pipe(map(user => {
                console.log("AuthfakeauthenticationService::login()/02")
                console.log("AuthfakeauthenticationService::login()/user.token:", user)
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    console.log("AuthfakeauthenticationService::login()/email:", email)
                    console.log("AuthfakeauthenticationService::login()/password:", password)
                    console.log("AuthfakeauthenticationService::login()/user:", JSON.stringify(user))
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}
