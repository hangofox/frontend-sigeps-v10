//IMPORTACIÓN DE LIBRERÍAS ANGULAR:
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

//SELECTOR, HTML, ESTILOS QUE INTEGRAN AL COMPONENTE:
@Component({
  selector: 'app-creditos',
  templateUrl: './creditos.component.html',
  styleUrls: ['./creditos.component.scss']
})
export class CreditosComponent implements OnInit {

  //DECLARACIÓN DE VARIABLES GLOBALES:
  isLoggedIn: boolean = false;
  nicknameUsuarioLogueado: string | null = null;
  creditosForm!: FormGroup;
  textoDerechosIntelectuales: string = '';

  //EQUIPO DE DESARROLLO — DATOS SIMULADOS:
  equipoDesarrollo = [
    { nombre: 'ARQ. SIGEPS', cargo: 'Arquitecto de Software', correo: 'arquitecto@sigeps.gov.co', rol: 'Diseño y arquitectura del sistema' },
    { nombre: 'DEV. BACKEND', cargo: 'Desarrollador Backend', correo: 'backend@sigeps.gov.co', rol: 'API REST, Spring Boot, PostgreSQL' },
    { nombre: 'DEV. FRONTEND', cargo: 'Desarrollador Frontend', correo: 'frontend@sigeps.gov.co', rol: 'Angular 18, TypeScript, SCSS' },
    { nombre: 'DBA. SIGEPS', cargo: 'Administrador de Base de Datos', correo: 'dba@sigeps.gov.co', rol: 'Modelo relacional, optimización de consultas' },
    { nombre: 'QA. SIGEPS', cargo: 'Analista de Calidad', correo: 'qa@sigeps.gov.co', rol: 'Pruebas funcionales y de seguridad' },
  ];

  //CONSTRUCTOR DEL COMPONENTE:
  constructor(private formBuilder: FormBuilder) {}

  //MÉTODO PRINCIPAL DEL COMPONENTE:
  ngOnInit(): void {
    //VERIFICA AUTENTICACIÓN:
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      this.isLoggedIn = true;
      this.nicknameUsuarioLogueado = localStorage.getItem('nicknameUsuarioLogueado');
    }
    this.textoDerechosIntelectuales = 'Todos los Derechos Intelectuales — Bogotá D.C., Colombia © 2026 SIGEPS V1.0.';
    this.initForm();
  }

  //MÉTODO DE INICIALIZACIÓN DEL FORMULARIO:
  initForm(): void {
    this.creditosForm = this.formBuilder.group({});
  }
}
