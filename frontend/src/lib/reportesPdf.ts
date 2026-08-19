import jsPDF from 'jspdf';
import type { Reporte, TipoReporte } from '../api/reportes';
import type { Producto } from '../api/productos';

const ETIQUETAS_TIPO: Record<TipoReporte, string> = {
  DIA: 'Hoy',
  SEMANA: 'Semana actual',
  MES: 'Mes actual',
  RANGO: 'Periodo personalizado',
};

const COLORES = {
  primario: [15, 23, 42] as [number, number, number],
  acento: [99, 102, 241] as [number, number, number],
  exito: [16, 185, 129] as [number, number, number],
  peligro: [244, 63, 94] as [number, number, number],
  grisOscuro: [30, 41, 59] as [number, number, number],
  grisMedio: [100, 116, 139] as [number, number, number],
  grisClaro: [226, 232, 240] as [number, number, number],
};

const FORMATO_MONEDA = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

const FORMATO_FECHA = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const FORMATO_FECHA_HORA = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export interface OpcionesPdf {
  nombreTienda?: string;
  generadoPor?: string;
}

export function generarPdfReporte(
  reporte: Reporte,
  productosStockBajo: Producto[],
  opciones: OpcionesPdf = {},
): jsPDF {
  const documento = new jsPDF({ unit: 'pt', format: 'a4' });
  const margenIzquierdo = 48;
  const margenDerecho = documento.internal.pageSize.getWidth() - 48;
  const anchoUtil = margenDerecho - margenIzquierdo;

  const generarEncabezado = () => {
    documento.setFillColor(...COLORES.primario);
    documento.rect(0, 0, documento.internal.pageSize.getWidth(), 96, 'F');

    documento.setTextColor(255, 255, 255);
    documento.setFont('helvetica', 'bold');
    documento.setFontSize(18);
    documento.text(opciones.nombreTienda ?? 'Gestion de Tienda', margenIzquierdo, 42);

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);
    documento.text(
      `Reporte ${ETIQUETAS_TIPO[reporte.tipo]} · ${FORMATO_FECHA.format(new Date(reporte.desde))} al ${FORMATO_FECHA.format(new Date(reporte.hasta))}`,
      margenIzquierdo,
      62,
    );

    documento.setFontSize(9);
    documento.text(
      `Generado el ${FORMATO_FECHA_HORA.format(new Date())}${opciones.generadoPor ? ` por ${opciones.generadoPor}` : ''}`,
      margenIzquierdo,
      80,
    );

    documento.setTextColor(...COLORES.grisOscuro);
  };

  let cursorY = 130;

  const asegurarEspacio = (alturaNecesaria: number): number => {
    const limite = documento.internal.pageSize.getHeight() - 60;
    if (cursorY + alturaNecesaria > limite) {
      documento.addPage();
      generarEncabezado();
      cursorY = 130;
    }
    return cursorY;
  };

  const dibujarTarjeta = (
    x: number,
    y: number,
    ancho: number,
    alto: number,
    etiqueta: string,
    valor: string,
    detalle: string,
    colorAcento: [number, number, number] = COLORES.acento,
  ) => {
    documento.setDrawColor(...COLORES.grisClaro);
    documento.setFillColor(255, 255, 255);
    documento.roundedRect(x, y, ancho, alto, 8, 8, 'FD');

    documento.setFillColor(...colorAcento);
    documento.rect(x, y, 4, alto, 'F');

    documento.setTextColor(...COLORES.grisMedio);
    documento.setFont('helvetica', 'bold');
    documento.setFontSize(8);
    documento.text(etiqueta.toUpperCase(), x + 14, y + 18);

    documento.setTextColor(...COLORES.primario);
    documento.setFont('helvetica', 'bold');
    documento.setFontSize(16);
    documento.text(valor, x + 14, y + 40);

    documento.setTextColor(...COLORES.grisMedio);
    documento.setFont('helvetica', 'normal');
    documento.setFontSize(9);
    const lineasDetalle = documento.splitTextToSize(detalle, ancho - 28);
    documento.text(lineasDetalle, x + 14, y + 58);
  };

  generarEncabezado();

  const tarjetas = [
    {
      etiqueta: 'Ingresos',
      valor: FORMATO_MONEDA.format(reporte.resumen.ingresos),
      detalle: `Total facturado en el periodo seleccionado.`,
      color: COLORES.exito,
    },
    {
      etiqueta: 'Ventas',
      valor: String(reporte.resumen.cantidadVentas),
      detalle: `Operaciones vigentes: ${reporte.ventasPorOrigen.MANUAL} manuales y ${reporte.ventasPorOrigen.VOZ} por voz.`,
      color: COLORES.acento,
    },
    {
      etiqueta: 'Stock bajo',
      valor: String(productosStockBajo.length),
      detalle: `Productos activos con menos de 5 unidades.`,
      color: COLORES.peligro,
    },
  ];

  const anchoTarjeta = (anchoUtil - 24) / 3;
  tarjetas.forEach((tarjeta, indice) => {
    dibujarTarjeta(
      margenIzquierdo + indice * (anchoTarjeta + 12),
      cursorY,
      anchoTarjeta,
      78,
      tarjeta.etiqueta,
      tarjeta.valor,
      tarjeta.detalle,
      tarjeta.color,
    );
  });
  cursorY += 100;

  // Productos más vendidos
  cursorY = asegurarEspacio(60);
  documento.setTextColor(...COLORES.primario);
  documento.setFont('helvetica', 'bold');
  documento.setFontSize(13);
  documento.text('Productos mas vendidos', margenIzquierdo, cursorY);
  cursorY += 8;

  documento.setDrawColor(...COLORES.grisClaro);
  documento.line(margenIzquierdo, cursorY, margenDerecho, cursorY);
  cursorY += 12;

  if (reporte.productosMasVendidos.length === 0) {
    documento.setTextColor(...COLORES.grisMedio);
    documento.setFont('helvetica', 'italic');
    documento.setFontSize(10);
    documento.text('No hay ventas registradas en este periodo.', margenIzquierdo, cursorY);
    cursorY += 20;
  } else {
    documento.setFont('helvetica', 'bold');
    documento.setFontSize(9);
    documento.setTextColor(...COLORES.grisMedio);
    documento.text('PRODUCTO', margenIzquierdo, cursorY);
    documento.text('UNIDADES', margenIzquierdo + anchoUtil - 200, cursorY, { align: 'left' });
    documento.text('TOTAL', margenDerecho, cursorY, { align: 'right' });
    cursorY += 8;

    documento.setDrawColor(...COLORES.grisClaro);
    documento.line(margenIzquierdo, cursorY, margenDerecho, cursorY);
    cursorY += 10;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);
    reporte.productosMasVendidos.forEach((producto) => {
      cursorY = asegurarEspacio(22);
      const nombre = documento.splitTextToSize(producto.nombre, anchoUtil - 260);
      documento.setTextColor(...COLORES.grisOscuro);
      documento.text(nombre, margenIzquierdo, cursorY);
      documento.setTextColor(...COLORES.grisOscuro);
      documento.text(String(producto.cantidadVendida), margenIzquierdo + anchoUtil - 200, cursorY);
      documento.setTextColor(...COLORES.primario);
      documento.setFont('helvetica', 'bold');
      documento.text(FORMATO_MONEDA.format(producto.totalGenerado), margenDerecho, cursorY, {
        align: 'right',
      });
      documento.setFont('helvetica', 'normal');
      cursorY += Math.max(18, nombre.length * 12);
    });
  }

  cursorY = asegurarEspacio(60) + 10;

  // Stock bajo
  documento.setTextColor(...COLORES.primario);
  documento.setFont('helvetica', 'bold');
  documento.setFontSize(13);
  documento.text('Productos con stock bajo', margenIzquierdo, cursorY);
  cursorY += 8;

  documento.setDrawColor(...COLORES.grisClaro);
  documento.line(margenIzquierdo, cursorY, margenDerecho, cursorY);
  cursorY += 12;

  if (productosStockBajo.length === 0) {
    documento.setTextColor(...COLORES.grisMedio);
    documento.setFont('helvetica', 'italic');
    documento.setFontSize(10);
    documento.text('No hay alertas de stock en este momento.', margenIzquierdo, cursorY);
    cursorY += 20;
  } else {
    documento.setFont('helvetica', 'bold');
    documento.setFontSize(9);
    documento.setTextColor(...COLORES.grisMedio);
    documento.text('PRODUCTO', margenIzquierdo, cursorY);
    documento.text('CATEGORIA', margenIzquierdo + anchoUtil / 2 - 60, cursorY);
    documento.text('STOCK', margenDerecho, cursorY, { align: 'right' });
    cursorY += 8;

    documento.setDrawColor(...COLORES.grisClaro);
    documento.line(margenIzquierdo, cursorY, margenDerecho, cursorY);
    cursorY += 10;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);
    productosStockBajo.forEach((producto) => {
      cursorY = asegurarEspacio(22);
      const nombre = documento.splitTextToSize(producto.nombre, anchoUtil / 2 - 30);
      documento.setTextColor(...COLORES.grisOscuro);
      documento.text(nombre, margenIzquierdo, cursorY);
      documento.setTextColor(...COLORES.grisMedio);
      documento.text(
        producto.categoria ?? 'Sin categoria',
        margenIzquierdo + anchoUtil / 2 - 60,
        cursorY,
      );
      documento.setTextColor(...COLORES.peligro);
      documento.setFont('helvetica', 'bold');
      documento.text(`${producto.stock} uds`, margenDerecho, cursorY, { align: 'right' });
      documento.setFont('helvetica', 'normal');
      cursorY += Math.max(18, nombre.length * 12);
    });
  }

  // Pie de pagina en todas las paginas
  const totalPaginas = documento.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    documento.setPage(i);
    documento.setTextColor(...COLORES.grisMedio);
    documento.setFont('helvetica', 'normal');
    documento.setFontSize(8);
    documento.text(
      `Documento simulado, sin validez fiscal · Pagina ${i} de ${totalPaginas}`,
      documento.internal.pageSize.getWidth() / 2,
      documento.internal.pageSize.getHeight() - 24,
      { align: 'center' },
    );
  }

  return documento;
}

export function descargarPdfReporte(
  reporte: Reporte,
  productosStockBajo: Producto[],
  opciones: OpcionesPdf = {},
): void {
  const documento = generarPdfReporte(reporte, productosStockBajo, opciones);
  const fecha = new Date().toISOString().slice(0, 10);
  documento.save(`reporte-${reporte.tipo.toLowerCase()}-${fecha}.pdf`);
}
