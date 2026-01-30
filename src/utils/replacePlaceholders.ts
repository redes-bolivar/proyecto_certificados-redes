import { CertificateData } from "@/components/CertificateForm";

const PROGRAM_HOURS: Record<string, number> = {
  "Asistente Administrativo": 1200,
  "Auxiliar Contable y Financiero": 1200,
  "Auxiliar en Talento Humano": 1200,
  "Auxiliar en Seguridad en El Trabajo": 1200,
  "Auxiliar Administrativo en Salud": 1600,
  "Auxiliar en Enfermería": 1800,
  "Manejo de Vehículos de Emergencia": 40,
  "AIEPI Comunitario": 40,
  "Profundización en UCI para Auxiliares de Enfermería": 120,
  "Facturación en Salud, Glosas, y Auditoría de Cuentas": 120,
  "Cuidado al Adulto Mayor": 40,
  "Desarrollo de Habilidades del Cuidador": 20,
  "Primeros Auxilios Básico": 20,
  "Camillaje": 20,
  "Soporte Vital Básico - BLS": 20,
  "Soporte Vital Cardiaco Avanzado - ACLS": 20,
  "Administración de Medicamentos": 20,
  "Administración de Inmunobiológicos": 40,
  "Inyectología": 20,
  "Toma de Muestras de Laboratorio": 40,
  "Servicio al Cliente Farmacéutico": 20,
  "Asistente de Droguería": 40,
  "Farmacología": 40,
  "Caja Registradora": 20,
  "Moldeamiento Corporal": 20,
  "Cuidados Básicos de La Piel": 20,
  "Técnicas de Depilación": 20,
  "Técnicas de Spa": 20,
  "Atención Integral a Víctimas de Violencia Sexual": 20,
  "Gestión del Duelo en el Ámbito de la Salud": 20,
  "Humanización en los Servicios de la Salud": 20
};

export const replacePlaceholders = (
  svg: string,
  data: CertificateData
): string => {

  const horas =
  data.tipoCertificado === "CURSOS_EMPRESARIALES"
    ? data.horasCurso
    : PROGRAM_HOURS[data.programaOCurso];

  const HORAS_TEXTO = horas ? `${horas} horas` : "";

  const nombreCurso = data.programaOCurso;

  var tallerOCurso = ""

  if (data.programaOCurso == "Soporte Vital Cardiaco Avanzado - ACLS"){
    tallerOCurso = "Taller"
  } else {
    tallerOCurso = "Curso"
  }

  const parseFecha = (fecha: any): Date => {
    // 1️⃣ Excel serial
    if (
      typeof fecha === "number" ||
      (typeof fecha === "string" && /^\d+$/.test(fecha))
    ) {
      const serial = Number(fecha);
      const excelEpoch = Date.UTC(1899, 11, 30);

      // Corrección Excel + crear fecha segura
      return new Date(excelEpoch + (serial + 1) * 86400000);
    }

    // 2️⃣ dd/mm/yyyy (manual o CSV)
    if (typeof fecha === "string" && fecha.includes("/")) {
      const [dia, mes, anio] = fecha.split("/");
      return new Date(
        Number(anio),
        Number(mes) - 1,
        Number(dia)
      );
    }

    // 3️⃣ yyyy-mm-dd (input type="date")
    if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [anio, mes, dia] = fecha.split("-");
      return new Date(
        Number(anio),
        Number(mes) - 1,
        Number(dia)
      );
    }

    return new Date();
  };

  const date = parseFecha(data.fechaCertificado);

  const DIAS = date.getDate().toString();
  const MES = date.toLocaleDateString("es-ES", { month: "long" });
  const ANIO = date.getFullYear().toString();

const getFontSizeNombre = (texto: string): number => {
  const BASE_SIZE = 125;
  const MAX_LENGTH = 20;
  const MIN_SIZE = 75;

  if (texto.length <= MAX_LENGTH) return BASE_SIZE;

  const exceso = texto.length - MAX_LENGTH;
  const sizeReducido = BASE_SIZE - exceso * 2;

  return Math.max(sizeReducido, MIN_SIZE);
};

  const FONT_SIZE_NOMBRE = getFontSizeNombre(nombreCurso);

  const nombrePersona = data.nombreCompleto;

const getFontSizePersona = (texto: string): number => {
  const BASE_SIZE = 125;
  const MAX_LENGTH = 20;
  const MIN_SIZE = 80;

  if (texto.length <= MAX_LENGTH) return BASE_SIZE;

  const exceso = texto.length - MAX_LENGTH;
  const sizeReducido = BASE_SIZE - exceso * 2;

  return Math.max(sizeReducido, MIN_SIZE);
};

  const FONT_SIZE_PERSONA = getFontSizePersona(nombrePersona);

  return svg
    .replace(/{{NOMBRE_COMPLETO}}/g, data.nombreCompleto)
    .replace(/{{FONT_SIZE_PERSONA}}/g, FONT_SIZE_PERSONA.toString())
    .replace(/{{CEDULA}}/g, data.cedula)
    .replace(/{{CIUDAD_EXPEDICION}}/g, data.lugarExpedicion)
    .replace(/{{CURSO_TALLER}}/g, tallerOCurso)
    .replace(
      /{{NOMBRE_PROGRAMA}}|{{NOMBRE_CURSO}}/g,
      data.programaOCurso
    )
    .replace(/{{FONT_SIZE_NOMBRE}}/g, FONT_SIZE_NOMBRE.toString())
    .replace(/{{HORAS}}/g, HORAS_TEXTO)
    .replace(/{{DIAS}}/g, DIAS)
    .replace(/{{MES}}/g, MES)
    .replace(/{{ANIO}}/g, ANIO)
    .replace(/{{LIBRO}}/g, data.libro ?? "")
    .replace(/{{FOLIO}}/g, data.folio?.toString() ?? "");
};
