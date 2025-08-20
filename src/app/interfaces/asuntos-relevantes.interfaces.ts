export interface AsuntoRelevanteReal {
  oid: string;
  titulo: string; // 🔧 Nuevo campo para título
  descripcion: string;
  estado: Estado;
  nivelEducativo: NivelEducativo;
  semaforo: Semaforo;
  categoria: Categoria;
  municipio: string | null; // 🔧 Puede ser null
  fechaOcurrido: string; // 🔧 Timestamp como string
  urlFuente?: string | null;
  destacado: boolean;
  resuelto: boolean;
  concentradoPrensa?: ConcentradoPrensa | null;
}

export interface Estado {
  oid: string;
  nombre: string;
  // __typename: string;
}

export interface NivelEducativo {
  oid: string;
  nombre: string;
  // __typename: string;
}

export interface Categoria {
  oid: string;
  nombre: string;
  // __typename: string;
}

export interface Semaforo {
  oid: string;
  nombre: string; // "Favorable", "Requiere Seguimiento", "Rojo"
  // __typename: string;
}

export interface ConcentradoPrensa {
  oid: string | null;
  fechaPublicacion: string | null; // 🔧 Timestamp como string
  fechaOcurrido: string | null; // 🔧 Timestamp como string
  encabezado: string | null;
  extracto: string | null;
  urlFuente: string | null;
  fechaCaptura: string | null; // 🔧 Timestamp como string
}

export interface SemaforoData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface EstadoData {
  nombre: string;
  cantidad: number;
}

export interface CategoriaData {
  nombre: string;
  cantidad: number;
}

export interface AsuntosRelevantesResponse {
  getAllAsuntosRelevantes: AsuntoRelevanteReal[];
  total: number;
  pagina: number;
  limite: number;
  hasMore: boolean;
}

export interface AsuntoRelevanteDetalleResponse {
  getAsuntoRelevante: AsuntoRelevanteReal;
}

export interface AsuntoRelevanteMapped {
  id: string; // será el oid
  titulo: string; // será el encabezado del concentradoPrensa o descripcion
  descripcion: string;
  categoria: string; // nombre de la categoria
  nivelEducativo: string; // nombre del nivelEducativo
  semaforo: 'verde' | 'amarillo' | 'rojo'; // mapear desde semaforo.nombre
  resuelto: boolean;
  fechaEvento: Date | null; // parsear fechaOcurrido desde timestamp
  estado: string; // nombre del estado
  localidad: string; // municipio (puede ser null)
  url?: string; // urlFuente
  destacado: boolean;
  concentradoPrensa?: ConcentradoPrensa | null;
}

export interface FiltrosAsuntos {
  estado?: string;
  categoria?: string;
  prioridad?: string;
  semaforo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  busqueda?: string;
  autor?: string;
  etiquetas?: string[];
}
