import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
})
export class SignUpPage {
  email: string = '';
  password: string = '';
  name: String= '';

  constructor(private router: Router) {}

  redirigir_home_login() {
    this.router.navigate(['login']);
  }

  register() {
    // Aquí puedes agregar cualquier lógica adicional antes de enviar el formulario
    // Por ejemplo, validaciones adicionales o llamadas a servicios de registro

    // Después de realizar cualquier validación adicional, puedes redirigir a la página de inicio de sesión
    this.router.navigate(['login']);
  }
}

