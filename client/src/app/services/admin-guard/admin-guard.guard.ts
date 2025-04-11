import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserDataService } from '../user-data/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private userDataService: UserDataService, private router: Router) {}

  canActivate(): boolean {
    const userData = this.userDataService.getUserDataFromCookies();
    
    if (userData && userData.accesslevel === 2) {
      return true; 
    }

    // this.router.navigate(['/dashboard']);
    return false;
  }
}
