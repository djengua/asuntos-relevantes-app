import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/services/ApiService';

interface PerfilUsuario {
  oid: string;
  username: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  estado: string;
  fechaRegistro: Date;
  ultimaConexion?: Date;
}

interface ConfiguracionApp {
  tamanoTexto: 'pequeño' | 'normal' | 'grande' | 'extra-grande';
  temaOscuro: boolean;
}

interface FontOption {
  value: 'pequeño' | 'normal' | 'grande' | 'extra-grande';
  label: string;
  multiplier: number;
  baseFontSize: number;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit, OnDestroy {
  // Datos del usuario
  usuario: PerfilUsuario = {
    oid: '',
    username: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    estado: '',
    fechaRegistro: new Date(),
    ultimaConexion: new Date(),
  };

  // Formulario para editar datos
  usuarioEditado: PerfilUsuario = { ...this.usuario };

  // Configuración de la app
  configuracion: ConfiguracionApp = {
    tamanoTexto: 'normal',
    temaOscuro: false,
  };

  // Estados del componente
  cargandoDatos: boolean = true;
  modoEdicion: boolean = false;
  mostrandoCambioPassword: boolean = false;

  // Formulario de contraseña
  passwordActual: string = '';
  passwordNueva: string = '';
  passwordConfirmar: string = '';

  // Estados de sesión
  sesionValida: boolean = true;
  tiempoSesion: string = '';

  // Subscripciones
  private subscriptions: Subscription = new Subscription();

  // Opciones de tamaño de texto
  readonly opcionesTamanoTexto: FontOption[] = [
    {
      value: 'pequeño',
      label: 'Pequeño (12px)',
      multiplier: 0.75,
      baseFontSize: 12,
      description: 'Ideal para pantallas grandes',
      icon: 'contract-outline',
    },
    {
      value: 'normal',
      label: 'Normal (16px)',
      multiplier: 1.0,
      baseFontSize: 16,
      description: 'Tamaño estándar recomendado',
      icon: 'text-outline',
    },
    {
      value: 'grande',
      label: 'Grande (20px)',
      multiplier: 1.25,
      baseFontSize: 20,
      description: 'Mejor legibilidad',
      icon: 'expand-outline',
    },
    {
      value: 'extra-grande',
      label: 'Extra Grande (24px)',
      multiplier: 1.5,
      baseFontSize: 24,
      description: 'Máxima accesibilidad',
      icon: 'resize-outline',
    },
  ];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    await this.inicializarComponente();
  }

  ngOnDestroy() {
    // this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.unsubscribe();
  }

  async inicializarComponente() {
    try {
      this.cargandoDatos = true;

      // Verificar sesión válida
      if (!this.verificarSesionValida()) {
        await this.mostrarToast('Sesión expirada. Redirigiendo...', 'warning');
        this.router.navigate([''], { replaceUrl: true });
        return;
      }

      // Cargar datos en paralelo
      await Promise.all([this.cargarDatosUsuario()]);

      // Calcular tiempo de sesión
      this.calcularTiempoSesion();
    } catch (error) {
      console.error('Error al inicializar perfil:', error);
      await this.mostrarToast('Error al cargar perfil', 'danger');
      // this.manejarErrorCarga();
    } finally {
      this.cargandoDatos = false;
    }
  }

  verificarSesionValida(): boolean {
    const oidUsuario = localStorage.getItem('OidUsuario');
    const token = localStorage.getItem('Token');
    this.sesionValida = !!(oidUsuario && token);
    return this.sesionValida;
  }

  calcularTiempoSesion() {
    const inicioSesion = localStorage.getItem('inicioSesion');
    if (inicioSesion) {
      const inicio = new Date(inicioSesion);
      const ahora = new Date();
      const diff = Math.floor(
        (ahora.getTime() - inicio.getTime()) / (1000 * 60)
      );

      if (diff < 60) {
        this.tiempoSesion = `${diff} minutos`;
      } else {
        const horas = Math.floor(diff / 60);
        this.tiempoSesion = `${horas} horas`;
      }
    } else {
      localStorage.setItem('inicioSesion', new Date().toISOString());
      this.tiempoSesion = '0 minutos';
    }
  }

  // async manejarErrorCarga() {
  //   const alert = await this.alertController.create({
  //     header: 'Error al cargar perfil',
  //     message: '¿Deseas reintentar o cerrar sesión?',
  //     buttons: [
  //       {
  //         text: 'Reintentar',
  //         handler: () => this.inicializarComponente(),
  //       },
  //       {
  //         text: 'Cerrar Sesión',
  //         handler: () => this.cerrarSesion(),
  //       },
  //     ],
  //   });
  //   await alert.present();
  // }

  volver() {
    this.router.navigate(['/home']);
  }

  private cargarDatosUsuario() {
    try {
      const oidUsuario = localStorage.getItem('OidUsuario') || '';
      const nombreUsuario = localStorage.getItem('NombreUsuario') || '';
      const username = localStorage.getItem('Username') || '';
      const apellidos = localStorage.getItem('ApellidoUsuario') || '';
      const estadoUsuario = localStorage.getItem('EstadoUsuario') || '';

      this.usuario = {
        oid: oidUsuario,
        username: username,
        nombre: nombreUsuario,
        apellido: apellidos,
        estado: estadoUsuario,
        fechaRegistro: new Date(),
        ultimaConexion: new Date(),
      };

      this.usuarioEditado = { ...this.usuario };
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      throw error;
    }
  }

  ocultarCambioPassword() {
    this.mostrandoCambioPassword = false;
    this.limpiarCamposPassword();
  }

  limpiarCamposPassword() {
    this.passwordActual = '';
    this.passwordNueva = '';
    this.passwordConfirmar = '';
  }

  mostrarCambioPassword() {
    this.mostrandoCambioPassword = true;
    this.limpiarCamposPassword();
  }

  async cambiarContrasena() {
    this.apiService
      .changePassword(
        this.usuario.username,
        this.passwordNueva,
        this.passwordConfirmar,
        this.passwordActual
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          console.log('✅ Datos recibidos del API:', response);
          // this.asuntosOriginales = response.getAllAsuntosRelevantes || [];
          // this.procesarDatos();
          // this.aplicarFiltros();
          // this.generarDashboardData();
          // this.cargando = false;

          // // Forzar detección de cambios
          // this.cdr.detectChanges();

          // loading.dismiss();
        },
        error: async (error: any) => {
          console.error('❌ Error al cargar asuntos:', error);
          // this.error = 'Error al cargar los datos';
          // this.cargando = false;
          // loading.dismiss();

          // const toast = await this.toastController.create({
          //   message: 'Error al cargar asuntos relevantes. Intenta nuevamente.',
          //   duration: 3000,
          //   color: 'danger',
          //   position: 'top',
          // });
          // await toast.present();
        },
      });
  }

  async mostrarConfirmacionCerrarSesion() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          cssClass: 'alert-button-danger',
          handler: () => this.cerrarSesion(),
        },
      ],
    });
    await alert.present();
  }

  guardarConfiguracion() {
    try {
      localStorage.setItem('configuracion', JSON.stringify(this.configuracion));
      this.mostrarToast('Configuración guardada', 'success');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      this.mostrarToast('Error al guardar configuración', 'danger');
    }
  }

  async cerrarSesion() {
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
      duration: 1500,
    });
    await loading.present();

    try {
      // Limpiar datos de sesión
      const itemsALimpiar = [
        'OidUsuario',
        'NombreUsuario',
        'ApellidoUsuario',
        'EstadoUsuario',
        'Token',
        '000t0k3nJ032WLKDT05',
        'historicoHallazgo',
        'Internet',
        'Serial',
        'inicioSesion',
      ];

      itemsALimpiar.forEach((item) => {
        localStorage.removeItem(item);
      });

      // Actualizar estado en DataService
      //
      // this.dataService.updateStateSession(false);

      // Limpiar subscripciones
      this.subscriptions.unsubscribe();

      // Navegar a login
      await this.router.navigate([''], { replaceUrl: true });
      await this.mostrarToast('Sesión cerrada exitosamente', 'success');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      await this.mostrarToast('Error al cerrar sesión', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private async ejecutarCierreSesion() {
    const loading = await this.loadingController.create({
      message: 'Cerrando sesión...',
      spinner: 'circular',
    });

    try {
      await loading.present();

      // Limpiar datos de sesión
      localStorage.removeItem('Token');
      localStorage.removeItem('usuario');

      // Simular tiempo de procesamiento
      await this.simularLlamadaAPI(1000);

      await loading.dismiss();

      // Redirigir a login
      this.router.navigate(['/login'], { replaceUrl: true });

      await this.mostrarToast('Sesión cerrada exitosamente', 'success');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      await loading.dismiss();
      await this.mostrarToast('Error al cerrar sesión', 'danger');
    }
  }

  private async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom',
    });
    await toast.present();
  }

  private simularLlamadaAPI(tiempo: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, tiempo);
    });
  }
}
