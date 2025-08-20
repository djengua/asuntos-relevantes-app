import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/ApiService';
import {
  AsuntoRelevanteMapped,
  AsuntoRelevanteReal,
  AsuntosRelevantesResponse,
  CategoriaData,
  EstadoData,
  FiltrosAsuntos,
  SemaforoData,
} from '../interfaces/asuntos-relevantes.interfaces';

interface DashboardData {
  totalAsuntos: number;
  asuntosCriticos: number;
  asuntosResueltos: number;
  asuntosDestacados: number;
  porcentajeResueltos: number;
  datosSemaforo: SemaforoData[];
  topEstados: EstadoData[];
  datosCategorias: CategoriaData[];
  estadosCriticos: EstadoCriticoData[];
  mejorGestion: MejorGestionData[];
}

interface EstadoCriticoData {
  nombre: string;
  asuntosRojos: number;
  totalAsuntos: number;
}

interface MejorGestionData {
  nombre: string;
  asuntosResueltos: number;
  totalAsuntos: number;
  porcentajeResueltos: number;
}

@Component({
  selector: 'app-asuntos-relevantes',
  templateUrl: 'asuntos-relevantes.page.html',
  styleUrls: ['asuntos-relevantes.page.scss'],
  standalone: false,
})
export class AsuntosRelevantesPage implements OnInit, OnDestroy {
  selectedTab: string = 'lista';

  filtroEstado: string = '';
  filtroSemaforo: string = '';
  filtroCategoria: string = '';
  searchTerm: string = '';
  dashboardFilter: string = 'todos';
  // Datos del API

  asuntosOriginales: AsuntoRelevanteReal[] = [];
  asuntosRelevantes: AsuntoRelevanteMapped[] = [];
  asuntosFiltrados: AsuntoRelevanteMapped[] = [];

  dashboardData: DashboardData = {
    totalAsuntos: 0,
    asuntosCriticos: 0,
    asuntosResueltos: 0,
    asuntosDestacados: 0,
    porcentajeResueltos: 0,
    datosSemaforo: [],
    topEstados: [],
    datosCategorias: [],
    estadosCriticos: [],
    mejorGestion: [],
  };

  estados: string[] = [];
  categorias: string[] = [];

  // Estados de carga
  cargando = false;
  error: string | null = null;

  // Paginación
  paginaActual = 1;
  limite = 20;
  total = 0;
  hasMore = false;

  // Filtros
  filtros: FiltrosAsuntos = {};

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarAsuntosRelevantes();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  async cargarAsuntosRelevantes(esRefresh: boolean = false) {
    if (esRefresh) {
      this.paginaActual = 1;
      this.asuntosRelevantes = [];
    }

    this.cargando = true;
    this.error = null;

    try {
      const subscription = this.apiService
        .cargarAsuntosRelevantes(this.filtros, this.paginaActual, this.limite)
        .subscribe({
          next: (response: AsuntosRelevantesResponse) => {
            this.asuntosOriginales = esRefresh
              ? response.getAllAsuntosRelevantes
              : [...response.getAllAsuntosRelevantes];
            this.procesarDatos();
            this.aplicarFiltros();
            this.generarDashboardData();
            this.hasMore = response.hasMore;
            this.cargando = false;
          },
          error: (error: any) => {
            console.log(error);
            console.error('Error al cargar asuntos relevantes:', error);
            this.error = 'Error al cargar los asuntos relevantes';
            this.cargando = false;
            this.mostrarToast(
              'Error al cargar los asuntos relevantes',
              'danger'
            );
          },
        });

      this.subscriptions.push(subscription);
    } catch (error) {
      console.error('Error general:', error);
      this.error = 'Error al cargar los asuntos relevantes';
      this.cargando = false;
      this.mostrarToast('Error al cargar los asuntos relevantes', 'danger');
    }
  }

  // Método heredado del componente original
  cargarAsuntos() {
    return this.cargarAsuntosRelevantes();
  }

  aplicarFiltros() {
    try {
      // ✅ SIEMPRE partir del array original
      let asuntosFiltrados = [...this.asuntosRelevantes];

      // Filtro por estado
      if (this.filtroEstado) {
        asuntosFiltrados = asuntosFiltrados.filter(
          (asunto) => asunto.estado === this.filtroEstado
        );
      }

      // Filtro por semáforo
      if (this.filtroSemaforo) {
        asuntosFiltrados = asuntosFiltrados.filter(
          (asunto) => asunto.semaforo === this.filtroSemaforo
        );
      }

      // Filtro por categoría
      if (this.filtroCategoria) {
        asuntosFiltrados = asuntosFiltrados.filter(
          (asunto) => asunto.categoria === this.filtroCategoria
        );
      }

      // 🔍 FILTRO POR BÚSQUEDA - SOLO EN TÍTULO Y DESCRIPCIÓN
      if (this.searchTerm && this.searchTerm.trim() !== '') {
        const termino = this.searchTerm.toLowerCase().trim();
        asuntosFiltrados = asuntosFiltrados.filter(
          (asunto) =>
            asunto.titulo.toLowerCase().includes(termino) ||
            asunto.descripcion.toLowerCase().includes(termino)
        );
      }

      // ✅ Asignar el resultado final
      this.asuntosFiltrados = asuntosFiltrados;

      // Forzar detección de cambios
      // this.cdr.detectChanges();

      console.log(
        '🔍 Filtros aplicados. Resultados:',
        this.asuntosFiltrados.length
      );
    } catch (error) {
      console.error('❌ Error al aplicar filtros:', error);
      this.asuntosFiltrados = [...this.asuntosRelevantes];
    }
  }

  generarDashboardData() {
    if (!this.asuntosRelevantes || this.asuntosRelevantes.length === 0) {
      return;
    }

    // Filtrar datos según el filtro del dashboard
    let asuntosDashboard = [...this.asuntosRelevantes];

    switch (this.dashboardFilter) {
      case 'criticos':
        asuntosDashboard = asuntosDashboard.filter(
          (a) => a.semaforo === 'rojo'
        );
        break;
      case 'pendientes':
        asuntosDashboard = asuntosDashboard.filter((a) => !a.resuelto);
        break;
      case 'destacados':
        asuntosDashboard = asuntosDashboard.filter((a) => a.destacado);
        break;
      default:
        // 'todos' - no filtrar
        break;
    }

    // Generar KPIs
    const totalAsuntos = asuntosDashboard.length;
    const asuntosCriticos = asuntosDashboard.filter(
      (a) => a.semaforo === 'rojo'
    ).length;
    const asuntosResueltos = asuntosDashboard.filter((a) => a.resuelto).length;
    const asuntosDestacados = asuntosDashboard.filter(
      (a) => a.destacado
    ).length;
    const porcentajeResueltos =
      totalAsuntos > 0
        ? Math.round((asuntosResueltos / totalAsuntos) * 100)
        : 0;

    // Generar datos del semáforo
    const semaforoStats = {
      verde: asuntosDashboard.filter((a) => a.semaforo === 'verde').length,
      amarillo: asuntosDashboard.filter((a) => a.semaforo === 'amarillo')
        .length,
      rojo: asuntosDashboard.filter((a) => a.semaforo === 'rojo').length,
    };

    const datosSemaforo: SemaforoData[] = [
      {
        name: 'verde',
        value: semaforoStats.verde,
        percentage:
          totalAsuntos > 0
            ? Math.round((semaforoStats.verde / totalAsuntos) * 100)
            : 0,
        color: '#22c55e',
      },
      {
        name: 'amarillo',
        value: semaforoStats.amarillo,
        percentage:
          totalAsuntos > 0
            ? Math.round((semaforoStats.amarillo / totalAsuntos) * 100)
            : 0,
        color: '#fbbf24',
      },
      {
        name: 'rojo',
        value: semaforoStats.rojo,
        percentage:
          totalAsuntos > 0
            ? Math.round((semaforoStats.rojo / totalAsuntos) * 100)
            : 0,
        color: '#ef4444',
      },
    ].filter((item) => item.value > 0);

    // Top 5 estados con más asuntos
    const estadosCount = asuntosDashboard.reduce((acc, asunto) => {
      acc[asunto.estado] = (acc[asunto.estado] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topEstados: EstadoData[] = Object.entries(estadosCount)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Asuntos por categoría
    const categoriasCount = asuntosDashboard.reduce((acc, asunto) => {
      acc[asunto.categoria] = (acc[asunto.categoria] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const datosCategorias: CategoriaData[] = Object.entries(categoriasCount)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    // Estados más críticos (con más asuntos rojos)
    const estadosCriticosMap = asuntosDashboard
      .filter((a) => a.semaforo === 'rojo')
      .reduce((acc, asunto) => {
        if (!acc[asunto.estado]) {
          acc[asunto.estado] = { asuntosRojos: 0, totalAsuntos: 0 };
        }
        acc[asunto.estado].asuntosRojos++;
        return acc;
      }, {} as { [key: string]: { asuntosRojos: number; totalAsuntos: number } });

    // Completar con totales por estado
    asuntosDashboard.forEach((asunto) => {
      if (estadosCriticosMap[asunto.estado]) {
        estadosCriticosMap[asunto.estado].totalAsuntos++;
      }
    });

    const estadosCriticos: EstadoCriticoData[] = Object.entries(
      estadosCriticosMap
    )
      .map(([nombre, data]) => ({
        nombre,
        asuntosRojos: data.asuntosRojos,
        totalAsuntos: data.totalAsuntos,
      }))
      .sort((a, b) => b.asuntosRojos - a.asuntosRojos)
      .slice(0, 5);

    // Estados con mejor gestión (más asuntos resueltos)
    const gestionMap = asuntosDashboard.reduce((acc, asunto) => {
      if (!acc[asunto.estado]) {
        acc[asunto.estado] = { resueltos: 0, total: 0 };
      }
      acc[asunto.estado].total++;
      if (asunto.resuelto) {
        acc[asunto.estado].resueltos++;
      }
      return acc;
    }, {} as { [key: string]: { resueltos: number; total: number } });

    const mejorGestion: MejorGestionData[] = Object.entries(gestionMap)
      .map(([nombre, data]) => ({
        nombre,
        asuntosResueltos: data.resueltos,
        totalAsuntos: data.total,
        porcentajeResueltos:
          data.total > 0 ? Math.round((data.resueltos / data.total) * 100) : 0,
      }))
      .filter((item) => item.totalAsuntos >= 2) // Solo estados con al menos 2 asuntos
      .sort((a, b) => b.porcentajeResueltos - a.porcentajeResueltos)
      .slice(0, 5);

    // Actualizar los datos del dashboard
    this.dashboardData = {
      totalAsuntos,
      asuntosCriticos,
      asuntosResueltos,
      asuntosDestacados,
      porcentajeResueltos,
      datosSemaforo,
      topEstados,
      datosCategorias,
      estadosCriticos,
      mejorGestion,
    };

    // setTimeout(() => {
    //   this.actualizarVariablesCSS();
    // }, 100);

    console.log('📊 Dashboard actualizado:', this.dashboardData);
  }

  async recargarDatos(event?: any) {
    await this.cargarAsuntosRelevantes(true);
    if (event) {
      event.target.complete();
    }
  }

  onTabChange(event: any) {
    try {
      this.selectedTab = event.detail.value;
      console.log('🔄 Tab seleccionado:', this.selectedTab);

      // Si cambia al dashboard, generar datos
      if (this.selectedTab === 'dashboard') {
        setTimeout(() => {
          this.generarDashboardData();
        }, 100);
      }

      // Forzar detección de cambios
      // this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error al cambiar tab:', error);
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

  verDetalle(asunto: any) {
    // Navegar al detalle del asunto
    this.router.navigate(['/asunto-detalle', asunto.id]);
  }

  async nuevoAsunto() {
    // Navegar a crear nuevo asunto
    this.router.navigate(['/nuevo-asunto']);
  }

  async mostrarOpcionesCompartir() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Compartir',
      buttons: [
        {
          text: 'Compartir lista',
          icon: 'share-outline',
          handler: () => {
            // Lógica para compartir
          },
        },
        {
          text: 'Exportar datos',
          icon: 'download-outline',
          handler: () => {
            // Lógica para exportar
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

  getColorSemaforo(semaforo: string): string {
    if (!semaforo) return 'medium';

    switch (semaforo.toLowerCase()) {
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

  getColorPrioridad(prioridad: string): string {
    if (!prioridad) return 'medium';

    switch (prioridad.toLowerCase()) {
      case 'alta':
      case 'critica':
      case 'urgente':
        return 'danger';
      case 'media':
      case 'normal':
        return 'warning';
      case 'baja':
      case 'minima':
        return 'success';
      default:
        return 'medium';
    }
  }

  trackByAsunto(index: number, asunto: any): any {
    return asunto.id || index;
  }

  obtenerFechaActualizacion(): string {
    const ahora = new Date();
    return `${ahora.getDate()}/${
      ahora.getMonth() + 1
    }/${ahora.getFullYear()} ${ahora.getHours()}:${ahora
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  formatearNombreSemaforo(nombre: string): string {
    if (!nombre) {
      return '';
    }
    return nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
  }

  tieneConcentradoPrensa(asunto: AsuntoRelevanteMapped): boolean {
    return !!(
      asunto?.concentradoPrensa &&
      (asunto.concentradoPrensa.oid || asunto.concentradoPrensa.encabezado)
    );
  }

  formatearFecha(fecha: Date | string | null | undefined): string {
    try {
      if (!fecha) {
        return 'Fecha no disponible';
      }

      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }

      // Formatear manualmente para evitar problemas del pipe
      const day = fechaObj.getDate().toString().padStart(2, '0');
      const month = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const year = fechaObj.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  }

  limpiarBusqueda() {
    this.searchTerm = '';
    this.aplicarFiltros();
  }

  buscarEnTiempoReal(event: any) {
    const valor = event.target.value;
    this.searchTerm = valor;
    setTimeout(() => {
      this.aplicarFiltros();
    }, 300);
  }

  calcularAnchoBarraCategoria(cantidad: number): number {
    if (
      !this.dashboardData.datosCategorias ||
      this.dashboardData.datosCategorias.length === 0
    ) {
      return 20; // ancho mínimo en porcentaje
    }

    const maxValor = this.dashboardData.datosCategorias[0]?.cantidad || 1;
    const anchoMinimo = 20; // ancho mínimo en porcentaje
    const anchoMaximo = 100; // ancho máximo en porcentaje

    const anchoCalculado =
      maxValor > 0
        ? anchoMinimo + (cantidad / maxValor) * (anchoMaximo - anchoMinimo)
        : anchoMinimo;

    return Math.max(anchoCalculado, anchoMinimo);
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroSemaforo = '';
    this.filtroCategoria = '';
    this.searchTerm = '';
    this.aplicarFiltros();
  }

  verDetalleAsunto(asunto: AsuntoRelevanteMapped, event?: Event) {
    console.log('🔗 Navegando al detalle del asunto:', asunto.id);

    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    try {
      if (!asunto || !asunto.id) {
        console.error('❌ Asunto inválido o sin ID:', asunto);
        this.mostrarToast('Error: Asunto no válido', 'danger');
        return;
      }

      console.log('🚀 Navegando a: /asunto-detalle/' + asunto.id);
      this.router.navigate(['/asunto-detalle', asunto.id]);
    } catch (error) {
      console.error('❌ Error general al navegar:', error);
      this.mostrarToast('Error al abrir el detalle', 'danger');
    }
  }

  private obtenerTituloSeguro(asuntoReal: AsuntoRelevanteReal): string {
    // Si hay concentrado de prensa con encabezado, usarlo como título
    if (asuntoReal.titulo) {
      return asuntoReal.titulo;
    }

    // Si no, truncar la descripción
    if (asuntoReal.descripcion) {
      return this.truncarTexto(asuntoReal.descripcion, 80);
    }

    return 'Sin título';
  }

  private truncarTexto(texto: string, limite: number): string {
    if (!texto || texto.length <= limite) {
      return texto || '';
    }
    return texto.substring(0, limite) + '...';
  }

  private procesarDatos() {
    try {
      // 🔧 VALIDACIÓN: Asegurarse de que tenemos datos válidos
      if (!this.asuntosOriginales || !Array.isArray(this.asuntosOriginales)) {
        console.warn('⚠️ Datos originales no válidos:', this.asuntosOriginales);
        this.asuntosOriginales = [];
        return;
      }

      // Mapear datos del API al formato del componente
      this.asuntosRelevantes = this.asuntosOriginales.map((asunto) =>
        this.mapearAsunto(asunto)
      );

      // Extraer listas únicas para filtros
      this.estados = [
        ...new Set(this.asuntosRelevantes.map((a) => a.estado).filter(Boolean)),
      ].sort();

      this.categorias = [
        ...new Set(
          this.asuntosRelevantes.map((a) => a.categoria).filter(Boolean)
        ),
      ].sort();

      console.log('✅ Asuntos procesados:', this.asuntosRelevantes.length);
      console.log('Estados disponibles:', this.estados);
      console.log('Categorías disponibles:', this.categorias);
    } catch (error) {
      console.error('❌ Error al procesar datos:', error);
      this.asuntosRelevantes = [];
      this.estados = [];
      this.categorias = [];
    }
  }

  private obtenerDescripcionSegura(asuntoReal: AsuntoRelevanteReal): string {
    // Si hay concentrado de prensa con extracto, usarlo como descripción
    if (asuntoReal.concentradoPrensa?.extracto) {
      return asuntoReal.concentradoPrensa.extracto;
    }

    // Si no, usar la descripción original
    return asuntoReal.descripcion || 'Sin descripción';
  }

  private mapearSemaforo(
    semaforoNombre: string
  ): 'verde' | 'amarillo' | 'rojo' {
    if (!semaforoNombre) {
      return 'verde';
    }

    const nombre = semaforoNombre.toLowerCase();
    if (nombre.includes('verde') || nombre.includes('favorable')) {
      return 'verde';
    }
    if (nombre.includes('amarillo') || nombre.includes('seguimiento')) {
      return 'amarillo';
    }
    if (nombre.includes('rojo')) {
      return 'rojo';
    }
    return 'verde'; // default
  }

  private mapearAsunto(asuntoReal: AsuntoRelevanteReal): AsuntoRelevanteMapped {
    try {
      // 🔧 VALIDACIONES: Verificar que el objeto tenga las propiedades necesarias
      if (!asuntoReal) {
        throw new Error('Asunto nulo o undefined');
      }

      // 🔧 VALIDAR Y CONVERTIR FECHA desde timestamp string
      let fechaEvento: Date | null = null;
      try {
        if (asuntoReal.fechaOcurrido) {
          // Convertir timestamp string a número y luego a Date
          const timestamp = parseInt(asuntoReal.fechaOcurrido, 10);
          if (!isNaN(timestamp)) {
            fechaEvento = new Date(timestamp);
            // Verificar si la fecha resultante es válida
            if (isNaN(fechaEvento.getTime())) {
              fechaEvento = null;
            }
          }
        }
      } catch (error) {
        console.warn(
          '⚠️ Error al procesar fecha:',
          asuntoReal.fechaOcurrido,
          error
        );
        fechaEvento = null;
      }

      // Mapear con valores seguros
      return {
        id: asuntoReal.oid || `asunto_${Date.now()}`,
        titulo: this.obtenerTituloSeguro(asuntoReal),
        descripcion: this.obtenerDescripcionSegura(asuntoReal),
        categoria: asuntoReal.categoria?.nombre || 'Sin categoría',
        nivelEducativo: asuntoReal.nivelEducativo?.nombre || 'Sin nivel',
        semaforo: this.mapearSemaforo(asuntoReal.semaforo?.nombre || ''),
        resuelto: asuntoReal.resuelto || false,
        fechaEvento,
        estado: asuntoReal.estado?.nombre || 'Sin estado',
        localidad: asuntoReal.municipio || 'Sin localidad',
        url: asuntoReal.urlFuente || undefined,
        destacado: asuntoReal.destacado || false,
        concentradoPrensa: asuntoReal.concentradoPrensa || null,
      };
    } catch (error) {
      console.error('❌ Error al mapear asunto:', error, asuntoReal);
      // Retornar un objeto por defecto en caso de error
      return {
        id: asuntoReal?.oid || `error_${Date.now()}`,
        titulo: 'Error al cargar título',
        descripcion: asuntoReal?.descripcion || 'Error al cargar descripción',
        categoria: 'Error',
        nivelEducativo: 'Error',
        semaforo: 'rojo',
        resuelto: false,
        fechaEvento: null,
        estado: 'Error',
        localidad: 'Error',
        url: undefined,
        destacado: false,
        concentradoPrensa: null,
      };
    }
  }
}
