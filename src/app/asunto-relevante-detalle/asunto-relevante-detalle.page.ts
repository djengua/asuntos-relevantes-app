import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetController,
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/ApiService';
import {
  AsuntoRelevanteMapped,
  AsuntoRelevanteReal,
} from '../interfaces/asuntos-relevantes.interfaces';

@Component({
  selector: 'app-asunto-relevante-detalle',
  templateUrl: './asunto-relevante-detalle.page.html',
  styleUrls: ['./asunto-relevante-detalle.page.scss'],
  standalone: false,
})
export class AsuntoRelevanteDetallePage implements OnInit, OnDestroy {
  // Datos del asunto
  asunto: AsuntoRelevanteMapped | null = null;
  asuntoReal: AsuntoRelevanteReal | null = null;
  asuntoId: string = '';

  // Estados de la aplicación
  cargando = false;
  error: string | null = null;
  esFavorito = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Obtener el ID desde los parámetros de la ruta
    this.route.paramMap.subscribe((params) => {
      this.asuntoId = params.get('id') || '';
      if (this.asuntoId) {
        this.cargarDetalleAsunto();
      } else {
        this.error = 'ID de asunto no válido';
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // const loading = await this.loadingController.create({
  //     message: 'Cargando detalle del asunto...',
  //     spinner: 'circular',
  //   });

  //   try {
  //     await loading.present();
  //     this.cargando = true;
  //     this.error = '';

  //     this.apiService.obtenerAsuntoRelevantePorId(this.asuntoId).subscribe({
  //       next: (response: any) => {
  //         this.asuntoOriginal = response.getAsuntoRelevante;
  //         this.asunto = this.mapearAsuntoDetalle(this.asuntoOriginal);

  //         // Verificar estados locales (favoritos, seguimiento)
  //         // this.verificarEstadosLocales();

  //         this.cargando = false;
  //         loading.dismiss();
  //       },
  //       error: async (error) => {
  //         console.error('❌ Error al cargar asunto:', error);
  //         this.error = 'Error al cargar el detalle del asunto';
  //         this.cargando = false;
  //         loading.dismiss();

  //         await this.mostrarToast(
  //           'Error al cargar el asunto. Intenta nuevamente.',
  //           'danger'
  //         );
  //       },
  //     });
  //   } catch (error) {
  //     console.error('❌ Error general:', error);
  //     this.cargando = false;
  //     loading.dismiss();
  //     this.error = 'Error inesperado';
  //   }

  async cargarDetalleAsunto() {
    this.cargando = true;
    this.error = null;

    try {
      // this.apiService.obtenerAsuntoRelevantePorId(this.asuntoId).subscribe({
      // next: (response: any) => {
      // this.asuntoOriginal = response.getAsuntoRelevante;
      // this.asunto = this.mapearAsuntoDetalle(this.asuntoOriginal);

      // // Verificar estados locales (favoritos, seguimiento)
      // // this.verificarEstadosLocales();

      // this.cargando = false;
      // loading.dismiss();
      // },
      // error: async (error) => {
      // console.error('❌ Error al cargar asunto:', error);
      // this.error = 'Error al cargar el detalle del asunto';
      // this.cargando = false;
      // loading.dismiss();

      // await this.mostrarToast(
      //   'Error al cargar el asunto. Intenta nuevamente.',
      //   'danger'
      // );
      // },
      // });

      console.log('Cargando detalle del asunto con ID:', this.asuntoId);
      const subscription = this.apiService
        .obtenerAsuntoDetalle(this.asuntoId)
        .subscribe({
          next: (response: any) => {
            console.log('Respuesta completa del detalle:', response);
            
            // Extraer el asunto desde la respuesta GraphQL
            const asuntoData = response.getAsuntoRelevante || response;
            
            console.log('Datos del asunto extraídos:', asuntoData);
            this.asuntoReal = asuntoData;
            this.asunto = this.mapearAsuntoDetalle(asuntoData);
            this.cargando = false;
            console.log('Asunto mapeado para la vista:', this.asunto);
          },
          error: (error: any) => {
            console.error('que paso compita');
            console.error('Error al cargar detalle del asunto:', error);
            this.error = 'Error al cargar el detalle del asunto';
            this.cargando = false;
            this.mostrarToast('Error al cargar el detalle', 'danger');
          },
        });

      this.subscriptions.push(subscription);
    } catch (error) {
      console.error('Error general:', error);
      this.error = 'Error al cargar el detalle del asunto';
      this.cargando = false;
      this.mostrarToast('Error al cargar el detalle', 'danger');
    }
  }

  async recargarAsunto(event?: any) {
    await this.cargarDetalleAsunto();
    if (event) {
      event.target.complete();
    }
  }

  volver() {
    this.router.navigate(['/home']);
  }

  async mostrarOpcionesCompartir() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Compartir Asunto',
      buttons: [
        {
          text: 'Copiar enlace',
          icon: 'copy-outline',
          handler: () => {
            this.copiarEnlace();
          },
        },
        {
          text: 'Compartir por email',
          icon: 'mail-outline',
          handler: () => {
            this.compartirPorEmail();
          },
        },
        {
          text: 'Compartir en redes sociales',
          icon: 'share-social-outline',
          handler: () => {
            this.compartirEnRedes();
          },
        },
        {
          text: 'Descargar PDF',
          icon: 'download-outline',
          handler: () => {
            this.descargarPDF();
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  async toggleFavorito() {
    // Aquí implementarías la lógica para agregar/quitar de favoritos
    this.esFavorito = !this.esFavorito;
    const mensaje = this.esFavorito
      ? 'Agregado a favoritos'
      : 'Removido de favoritos';
    await this.mostrarToast(mensaje, 'success');
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

  private async copiarEnlace() {
    // Implementar lógica para copiar enlace al portapapeles
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      await this.mostrarToast('Enlace copiado al portapapeles', 'success');
    } catch (error) {
      console.error('Error al copiar enlace:', error);
      await this.mostrarToast('Error al copiar enlace', 'danger');
    }
  }

  private compartirPorEmail() {
    if (this.asunto) {
      const subject = encodeURIComponent(
        `Asunto Relevante: ${this.asunto.titulo}`
      );
      const body = encodeURIComponent(
        `Te comparto este asunto relevante:\n\n${this.asunto.titulo}\n\n${this.asunto.descripcion}\n\nVer más detalles: ${window.location.href}`
      );
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }
  }

  private compartirEnRedes() {
    if (this.asunto) {
      const texto = encodeURIComponent(
        `${this.asunto.titulo} - ${this.asunto.descripcion.substring(
          0,
          100
        )}...`
      );
      const url = encodeURIComponent(window.location.href);

      // Abrir ventana para compartir en Twitter/X
      window.open(
        `https://twitter.com/intent/tweet?text=${texto}&url=${url}`,
        '_blank'
      );
    }
  }

  private async descargarPDF() {
    // Aquí implementarías la lógica para generar y descargar PDF
    await this.mostrarToast('Función de descarga PDF en desarrollo', 'warning');
  }

  private mapearAsuntoDetalle(
    asuntoReal: AsuntoRelevanteReal
  ): AsuntoRelevanteMapped {
    try {
      // Mapear fecha
      let fechaEvento: Date | null = null;
      try {
        if (asuntoReal.fechaOcurrido) {
          const timestamp = parseInt(asuntoReal.fechaOcurrido, 10);
          if (!isNaN(timestamp)) {
            fechaEvento = new Date(timestamp);
            if (isNaN(fechaEvento.getTime())) {
              fechaEvento = null;
            }
          }
        }
      } catch (error) {
        console.warn('Error al procesar fecha:', error);
        fechaEvento = null;
      }

      // Mapear semáforo
      const mapearSemaforo = (
        semaforoNombre: string
      ): 'verde' | 'amarillo' | 'rojo' => {
        if (!semaforoNombre) return 'verde';
        const nombre = semaforoNombre.toLowerCase();
        if (nombre.includes('verde') || nombre.includes('favorable'))
          return 'verde';
        if (nombre.includes('amarillo') || nombre.includes('seguimiento'))
          return 'amarillo';
        if (nombre.includes('rojo')) return 'rojo';
        return 'verde';
      };

      return {
        id: asuntoReal.oid || `asunto_${Date.now()}`,
        titulo:
          asuntoReal.titulo ||
          asuntoReal.concentradoPrensa?.encabezado ||
          'Sin título',
        descripcion:
          asuntoReal.descripcion ||
          asuntoReal.concentradoPrensa?.extracto ||
          'Sin descripción',
        categoria: asuntoReal.categoria?.nombre || 'Sin categoría',
        nivelEducativo: asuntoReal.nivelEducativo?.nombre || 'Sin nivel',
        semaforo: mapearSemaforo(asuntoReal.semaforo?.nombre || ''),
        resuelto: asuntoReal.resuelto || false,
        fechaEvento,
        estado: asuntoReal.estado?.nombre || 'Sin estado',
        localidad: asuntoReal.municipio || 'Sin localidad',
        url: asuntoReal.urlFuente || undefined,
        destacado: asuntoReal.destacado || false,
        concentradoPrensa: asuntoReal.concentradoPrensa || null,
      };
    } catch (error) {
      console.error('Error al mapear asunto detalle:', error);
      throw error;
    }
  }

  // Métodos auxiliares para la vista
  getColorSemaforo(): string {
    if (!this.asunto) return 'medium';

    switch (this.asunto.semaforo) {
      case 'verde':
        return 'success';
      case 'amarillo':
        return 'warning';
      case 'rojo':
        return 'danger';
      default:
        return 'medium';
    }
  }

  formatearFecha(fecha: Date | string | null | undefined): string {
    try {
      if (!fecha) return 'Fecha no disponible';

      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      if (isNaN(fechaObj.getTime())) return 'Fecha inválida';

      const day = fechaObj.getDate().toString().padStart(2, '0');
      const month = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const year = fechaObj.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  }

  tieneConcentradoPrensa(): boolean {
    return !!(
      this.asunto?.concentradoPrensa &&
      (this.asunto.concentradoPrensa.oid ||
        this.asunto.concentradoPrensa.encabezado)
    );
  }

  abrirUrlFuente() {
    if (this.asunto?.url) {
      window.open(this.asunto.url, '_blank');
    } else if (this.asunto?.concentradoPrensa?.urlFuente) {
      window.open(this.asunto.concentradoPrensa.urlFuente, '_blank');
    }
  }
}
