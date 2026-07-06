import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { SessionService } from '../services/session/session.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardRoute implements CanActivate {

  constructor(
    private router: Router,
    private sessionService: SessionService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (!this.sessionService.isLoggedIn()) {
      this.router.navigate(['/']);
      return of(false);
    }
    return of(true);
  }
}
