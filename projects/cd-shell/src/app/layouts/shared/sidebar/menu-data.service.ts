import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MenuDataService {
    menuData: any = []
    private menuDataSubject = new BehaviorSubject<any>(null);
    menuData$ = this.menuDataSubject.asObservable();

    constructor(private http: HttpClient) { }

    fetchMenuData(): Observable<any> {
        // Assuming your API endpoint to fetch menu data is '/api/menu'
        return this.http.get<any>('/api/menu');
    }

    setMenuData(data: any): void {
        this.menuDataSubject.next(data);
    }
}
