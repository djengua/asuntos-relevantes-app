import { Component, OnInit } from '@angular/core';
import { UserData } from '../interfaces/user';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/services/ApiService';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  versionApp: string;
  errorMsg: string;
  passwordType: string;
  passwordShown: boolean;
  passworIcon: string;
  usuario: UserData = {
    username: '',
    password: '',
    celular: '',
  };

  constructor(
    private router: Router,
    private api: ApiService,
    public loadingController: LoadingController
  ) {
    this.versionApp = '1.0.0';
    this.errorMsg = '<>';
    this.passwordType = 'password';
    this.passwordShown = false;
    this.passworIcon = '';
  }

  async ngOnInit() {}

  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      duration: 9000,
      message: 'Iniciando sesión...',
      cssClass: 'custom-loader-class',
    });
    return await loading.present();
  }

  async login() {
    try {
      this.presentLoadingWithOptions();
      this.api.login(this.usuario.username, this.usuario.password).subscribe({
        next: (result: any) => {
          this.loadingController.dismiss();
          console.log('Respuesta del servidor:', result);
          if (result.message.includes('Usuario o password incorrecto')) {
            // Manejar error de credenciales
            console.error('Credenciales incorrectas');
          } else if (result.message.includes('Usuario no activo')) {
            // Manejar usuario inactivo
            console.error('Usuario inactivo');
          } else if (result.message.includes('Login Correcto')) {
            // Login exitoso
            localStorage.setItem('OidUsuario', result.usuario.oid || '');
            localStorage.setItem('NombreUsuario', result.usuario.nombre || '');
            localStorage.setItem(
              'ApellidoUsuario',
              result.usuario.apellidos || ''
            );
            localStorage.setItem('Username', result.usuario.username || '');
            localStorage.setItem(
              'EstadoUsuario',
              result.usuario.estado.oid || ''
            );
            localStorage.setItem('Token', result.token || '');
            this.router.navigate(['/home']);
          }
        },
        error: (error: any) => {
          this.errorMsg = error;
          console.error('Error en login:', error);
          this.loadingController.dismiss();
          localStorage.clear();
        },
      });
    } catch (error) {
      console.error('Error general:', error);
      this.loadingController.dismiss();
      localStorage.clear();
    }
  }

  togglePassword() {
    if (this.passwordShown) {
      this.passwordShown = false;
      this.passwordType = 'password';
    } else {
      this.passwordShown = true;
      this.passwordType = 'text';
    }
  }

  validarCampos(): void {
    if (this.usuario.username === '' || this.usuario.password === '') {
      //   Swal.fire({
      //     icon: 'error',
      //     title: '¡El campo usuario y contraseña son obligatorios!',
      //     text: 'Por favor, ingrese un usuario y una contraseña válida!',
      //     showConfirmButton: false,
      //     timer: 2000,
      //   });
    } else {
      this.login();
    }
  }
}
