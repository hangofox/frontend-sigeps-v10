import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session/session.service';

@Component({
  selector: 'app-cabezote',
  templateUrl: './cabezote.component.html',
  styleUrls: ['./cabezote.component.scss']
})
export class CabezoteComponent implements OnInit {

  nombreUsuario: string = '';

  constructor(
    private router: Router,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || localStorage.getItem('nicknameUsuarioLogueado') || '';
  }

  cerrarSesion(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/']);
  }
}
