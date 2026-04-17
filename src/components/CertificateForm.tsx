import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerFolio } from "@/services/folioService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { guardarCertificadoEnDrive } from "@/services/certificadoDriveService";
import { disminuirFolio } from "@/services/folioServiceError";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { enviarResumen } from "@/services/enviarResumen";
import { formatearFechaHora } from "@/utils/formatearFecha";
import { formatearDuracion } from "@/utils/formatearDuracion";

export interface CertificateData {
  nombreCompleto: string;
  cedula: string;
  lugarExpedicion: string;
  tipoCertificado: "PROGRAMAS_TECNICO_LABORALES" | "CURSOS_CICLICOS" | "DIPLOMADOS" | "CURSOS_EMPRESARIALES";
  programaOCurso: string;
  cursoGeneral?: string;
  fechaCertificado?: string;
  libro?: string;
  folio?: number;
  horasCurso?: "8" | "12" | "32";
  codigoInstitucional?: string;
}

interface CertificateFormProps {
  onGenerate: (data: CertificateData[]) => void;
}

const PROGRAMAS_TECNICOS = [
  "Auxiliar en Enfermería",
  "Auxiliar en Seguridad en El Trabajo",
  "Asistente Administrativo",
  "Auxiliar en Talento Humano",
  "Auxiliar Contable y Financiero",
  "Auxiliar en Artes Gráficas",
  "Auxiliar Administrativo en Salud",
  "Asistencia y Soporte de Tecnologías de La Información",
];

const CURSOS_CICLICOS = [
  "Home Care: Entrenamiento Integral para Cuidadores Domiciliarios",
  "Atención Prehospitalaria",
  "Administración de Fármacos y Procedimientos Asistenciales",
  "Ventas Sector Farmacéutico",
  "Cuidado Estético y Bienestar Integral",
  "Manejo de Vehículos de Emergencia",
  "AIEPI Comunitario",
  "Normativo en Salud"
];

const CURSOS_INTERNOS: Record<string, string[]> = {
  "Home Care: Entrenamiento Integral para Cuidadores Domiciliarios": [
    "Cuidado Domiciliario",
    "Desarrollo de Habilidades del Cuidador",
  ],
  "Atención Prehospitalaria": [
    "Primeros Auxilios Básico",
    "Camillaje",
    "Soporte Vital Básico - BLS",
    "Soporte Vital Cardiaco Avanzado - ACLS",
  ],
  "Administración de Fármacos y Procedimientos Asistenciales": [
    "Administración de Medicamentos",
    "Administración de Inmunobiológicos",
    "Inyectología",
    "Toma de Muestras de Laboratorio",
  ],
  "Ventas Sector Farmacéutico": [
    "Servicio al Cliente Farmacéutico",
    "Asistente de Droguería",
    "Farmacología",
    "Caja Registradora",
  ],
  "Cuidado Estético y Bienestar Integral": [
    "Moldeamiento Corporal",
    "Cuidados Básicos de La Piel",
    "Técnicas de Depilación",
    "Técnicas de Spa",
  ],
  "Normativo en Salud": [
    "Atención Integral a Víctimas de Violencia Sexual",
    "Gestión del Duelo en el Ámbito de la Salud",
    "Humanización en los Servicios de la Salud"
  ]
};

const DIPLOMADOS = [
  "Profundización en UCI para Auxiliares de Enfermería",
  "Facturación en Salud, Glosas, y Auditoría de Cuentas"
];

const CURSOS_EMPRESARIALES = [
  "Primeros Auxilios",
  "Primeros Auxilios Básico",
  "Entrenamiento a Brigadas de Emergencia",
  "Entrenamiento en Reanimación Cardiopulmonar",
  "Brigadas de Evacuación",
  "Evacuación",
  "Control y Prevención de Incendios",
  "Manejo de Crisis en Situación de Emergencia",
  "Búsqueda y Rescate",
  "Rescate en Alturas",
  "Salvamento Acuático (Entrenamiento)",
  "Salvamento Acuático (Actualización)",
  "Bioseguridad Prevención Covid 19 y Otras Enfermedades",
  "Primeros Auxilios Psicológicos",
  "Promoción y Prevención (Enfermedades Cardiovasculares)",
  "Hábitos de Vida y de Trabajo Saludable",
  "Soporte Vital Básico",
  "Soporte Vital Avanzado Con Uso del DEA",
  "Primeros Auxilios Avanzados (RCP y Camillaje)",
  "Minas Antipersonal",
  "Primeros Auxilios, RCP y Camillaje",
  "Atención Integral de Urgencias a Víctimas de Ataque por Agentes Químicos"
]


export const CertificateForm = ({ onGenerate }: CertificateFormProps) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<CertificateData>({
    nombreCompleto: "",
    cedula: "",
    lugarExpedicion: "",
    tipoCertificado: "PROGRAMAS_TECNICO_LABORALES",
    programaOCurso: "",
    fechaCertificado: undefined,
    folio: null
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [cursoInterno, setCursoInterno] = useState("");
  const [horasCurso, setHorasCurso] = useState<"8" | "12" | "32" | undefined>(undefined);
  const [showCodigoDialog, setShowCodigoDialog] = useState(false);
  const [codigoInstitucional, setCodigoInstitucional] = useState("");
  const [accionPendiente, setAccionPendiente] =
    useState<"single" | "masivo" | null>(null);

  const [archivoPendiente, setArchivoPendiente] =
    useState<React.ChangeEvent<HTMLInputElement> | null>(null);

  useEffect(() => {
    setCursoInterno("");
    setHorasCurso(undefined);
  }, [formData.programaOCurso]);


  const resetFlujo = () => {
    setCodigoInstitucional("");
    setAccionPendiente(null);
    setArchivoPendiente(null);
    setCursoInterno("");
    setHorasCurso(undefined);

    setFormData({
      nombreCompleto: "",
      cedula: "",
      lugarExpedicion: "",
      tipoCertificado: "PROGRAMAS_TECNICO_LABORALES",
      programaOCurso: "",
      fechaCertificado: undefined,
    });
  };

  const handleChange = (field: keyof CertificateData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "tipoCertificado" ? { programaOCurso: "" } : {}),
    }));
  };

  const getTipoParaFolio = (item: CertificateData) =>
    item.tipoCertificado === "PROGRAMAS_TECNICO_LABORALES"
      ? item.programaOCurso
      : item.tipoCertificado;

  const procesarArchivoMasivo = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();

    const procesarDatos = async (rows: any[]) => {
      const validData = rows
        .map(validarRegistro)
        .filter(Boolean) as CertificateData[];

      if (validData.length === 0) {
        toast({
          title: "Archivo inválido",
          description: "El archivo no contiene registros válidos.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsProcessing(true);
        setProgress(0);

        const total = validData.length;
        const zip = new JSZip();
        const carpeta = zip.folder("certificados");
        const inicio = Date.now();

        const resumen = {
          total,
          exitosos: 0,
          fallidos: 0,
          inicio
        };

        for (let i = 0; i < total; i++) {
          const item = validData[i];

          setProgressText(`Generando ${i + 1}/${total}`);
          setProgress(Math.round((i / total) * 100));

          try {

            const folioData = await obtenerFolio(getTipoParaFolio(item));

            const result = await guardarCertificadoEnDrive({
              ...item,
              libro: folioData.libro,
              folio: folioData.folio,
              codigoInstitucional,
            });

            carpeta?.file(
              `${item.cedula}_${item.programaOCurso}.pdf`,
              result.pdfBlob
            );

            resumen.exitosos++; // ✅
          } catch (error) {
            resumen.fallidos++; // ✅
            await disminuirFolio(item.tipoCertificado);
          }
        }

        const totalSegundos = Math.round(
          (Date.now() - resumen.inicio) / 1000
        );

        const duracion = formatearDuracion(totalSegundos);

        toast({
          title: "Proceso completado",
          description: `Se generaron ${total} certificados`,


        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `certificados_${new Date().toISOString()}.zip`);

        try {
          await enviarResumen({
            total: resumen.total,
            exitosos: resumen.exitosos,
            fallidos: resumen.fallidos,
            duracion: duracion.texto,
            fecha: formatearFechaHora(),
          });
        } catch (error) {
          console.error("No se pudo enviar el resumen", error);
        }

        resetFlujo();
      } finally {
        setIsProcessing(false);
        setProgress(0);
        setProgressText("");
        resetFlujo();
      }
    };

    if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(sheet);

        const normalizado = raw.map((row: any) => {
          const obj: any = {};
          Object.keys(row).forEach((key) => {
            obj[key.trim().toLowerCase().replace(/\s+/g, "")] = row[key];
          });
          return obj;
        });

        procesarDatos(normalizado);
      };
      reader.readAsArrayBuffer(file);
    }

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase(),
        complete: (results) => procesarDatos(results.data as any[]),
      });
    }
  };

  const handleGenerateSingle = async () => {
    const { nombreCompleto, cedula, lugarExpedicion, programaOCurso } = formData;

    if (!nombreCompleto || !cedula || !lugarExpedicion || !programaOCurso) {
      toast({
        title: "Campos incompletos",
        description: "Complete todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (
      formData.tipoCertificado === "CURSOS_EMPRESARIALES" &&
      !horasCurso
    ) {
      toast({
        title: "Campo obligatorio",
        description:
          "Debe seleccionar la intensidad horaria para cursos empresariales.",
        variant: "destructive",
      });
      return;
    }

    if (formData.folio && !formData.libro) {
      toast({
        title: "Libro requerido",
        description: "Debe ingresar el libro cuando el folio es manual.",
        variant: "destructive",
      });
      return;
    }



    try {
      setIsProcessing(true);
      setProgress(10);
      setProgressText("Generando 1 archivo...");

      const folioData = formData.folio
        ? { folio: formData.folio, libro: formData.libro! }
        : await obtenerFolio(getTipoParaFolio(formData));

      setProgress(40);

      const tieneCursoInterno =
        formData.tipoCertificado === "CURSOS_CICLICOS" &&
        CURSOS_INTERNOS[formData.programaOCurso] &&
        cursoInterno;

      const programaFinal = tieneCursoInterno
        ? cursoInterno
        : formData.programaOCurso;

      const cursoGeneral = tieneCursoInterno
        ? formData.programaOCurso
        : undefined;

      const dataConFolio: CertificateData = {
        ...formData,
        programaOCurso: programaFinal, // 👈 carpeta final
        cursoGeneral,
        horasCurso:
          formData.tipoCertificado === "CURSOS_EMPRESARIALES"
            ? horasCurso
            : undefined,
        libro: folioData.libro,
        folio: folioData.folio,
      };


      const result = await guardarCertificadoEnDrive({
        ...dataConFolio,
        codigoInstitucional,
      });

      setProgress(90);

      if (result.response.status === "ok") {
        setProgress(100);
        toast({
          title: "Certificado guardado",
          description: "El certificado fue almacenado en Google Drive",
        });
        //onGenerate([dataConFolio]); // Solo se ejecuta si todo salió bien
        resetFlujo();
      } else {
        await disminuirFolio(formData.tipoCertificado);
        toast({
          title: "Error",
          description: result.response.mensaje || "No se pudo guardar el certificado",
          variant: "destructive",
        });
      }

      //onGenerate([dataConFolio]);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar o guardar el certificado",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressText("");
    }

    setFormData({
      nombreCompleto: "",
      cedula: "",
      lugarExpedicion: "",
      tipoCertificado: "PROGRAMAS_TECNICO_LABORALES",
      programaOCurso: "",
    });
  };

  const opcionesPrograma =
    formData.tipoCertificado === "PROGRAMAS_TECNICO_LABORALES"
      ? PROGRAMAS_TECNICOS
      : formData.tipoCertificado === "CURSOS_CICLICOS"
        ? CURSOS_CICLICOS
        : formData.tipoCertificado === "CURSOS_EMPRESARIALES"
          ? CURSOS_EMPRESARIALES
          : DIPLOMADOS;

  const validarRegistro = (row: any): CertificateData | null => {
    const registro: CertificateData = {
      nombreCompleto: row.nombrecompleto?.toString().trim() || "",
      cedula: row.cedula?.toString().trim() || "",
      lugarExpedicion: row.lugarexpedicion?.toString().trim() || "",
      tipoCertificado: row.tipocertificado,
      programaOCurso: row.programaocurso?.toString().trim() || "",
      cursoGeneral: row.cursogeneral?.toString().trim() || undefined,
      fechaCertificado: row.fechacertificado?.toString() || undefined,
      horasCurso: row.horascurso?.toString() as "8" | "12" | "32" | undefined,
    };

    const tipoValido =
      registro.tipoCertificado === "PROGRAMAS_TECNICO_LABORALES" ||
      registro.tipoCertificado === "CURSOS_CICLICOS" ||
      registro.tipoCertificado === "CURSOS_EMPRESARIALES" ||
      registro.tipoCertificado === "DIPLOMADOS"

    if (
      !registro.nombreCompleto ||
      !registro.cedula ||
      !registro.lugarExpedicion ||
      !registro.programaOCurso ||
      !tipoValido
    ) {
      return null;
    }

    return registro;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArchivoPendiente(event);
    setAccionPendiente("masivo");
    setShowCodigoDialog(true);

    //const ext = file.name.split(".").pop()?.toLowerCase();
    /*
    const procesarDatos = async (rows: any[]) => {
      const validData = rows
        .map(validarRegistro)
        .filter(Boolean) as CertificateData[];

      if (validData.length === 0) {
        toast({
          title: "Archivo inválido",
          description:
            "El archivo no contiene registros válidos o las columnas no coinciden.",
          variant: "destructive",
        });
        return;
      }
      

      try {
        setIsProcessing(true);
        setProgress(0);

        const total = validData.length;

        const dataConFolio: CertificateData[] = [];

        for (let i = 0; i < total; i++) {
          const item = validData[i];

          setProgressText(`Generando archivo ${i + 1}/${total}`);
          setProgress(Math.round((i / total) * 100));

          const folioData = await obtenerFolio(item.tipoCertificado);

          const certificado: CertificateData = {
            ...item,
            libro: folioData.libro,
            folio: folioData.folio,
            codigoInstitucional
          };

          const response = await guardarCertificadoEnDrive(certificado);

          if (response.status === "ok") {
            dataConFolio.push(certificado);
          } else {
            await disminuirFolio(item.tipoCertificado);
            toast({
              title: "Error",
              description: response.mensaje || "No se pudo guardar un certificado",
              variant: "destructive",
            });
          }
        }

        setProgress(100);
        setProgressText("Finalizando...");

        toast({
          title: "Proceso completado",
          description: `Se generaron ${dataConFolio.length} certificados`,
        });

        //onGenerate(dataConFolio);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error obteniendo folios para los certificados",
          variant: "destructive",
        });
      } finally {
          setIsProcessing(false);
          setProgress(0);
          setProgressText("");
        }
    };

    if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(sheet);
        const json = raw.map((row: any) => {
          const normalized: any = {};
          Object.keys(row).forEach((key) => {
            normalized[key.trim().toLowerCase()] = row[key];
          });
          return normalized;
        });
        procesarDatos(json);
      };
      reader.readAsArrayBuffer(file);
    } else if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase(),
        complete: (results) => procesarDatos(results.data as any[]),
      });
    } else {
      toast({
        title: "Formato no soportado",
        description: "Solo se permiten archivos CSV o Excel.",
        variant: "destructive",
      });
    }

    event.target.value = "";*/
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#CC0000]">
            <FileText className="h-5 w-5 text-[#CC0000]" />
            Ingreso Manual
          </CardTitle>
          <CardDescription>
            Complete los datos del estudiante
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Nombre completo *</Label>
            <Input
              value={formData.nombreCompleto}
              className="focus-visible:ring-[#cc0000]"
              onChange={(e) => handleChange("nombreCompleto", e.target.value)}
            />
          </div>

          <div>
            <Label>Cédula *</Label>
            <Input
              value={formData.cedula}
              className="focus-visible:ring-[#cc0000]"
              onChange={(e) => handleChange("cedula", e.target.value)}
            />
          </div>

          <div>
            <Label>Lugar de expedición *</Label>
            <Input
              value={formData.lugarExpedicion}
              className="focus-visible:ring-[#cc0000]"
              onChange={(e) => handleChange("lugarExpedicion", e.target.value)}
            />
          </div>

          <div>
            <Label>Tipo de certificado *</Label>
            <select
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
              value={formData.tipoCertificado}
              onChange={(e) =>
                handleChange(
                  "tipoCertificado",
                  e.target.value as CertificateData["tipoCertificado"]
                )
              }
            >
              <option value="PROGRAMAS_TECNICO_LABORALES">
                Programas Técnico Laborales
              </option>
              <option value="CURSOS_CICLICOS">Cursos Cíclicos</option>
              <option value="DIPLOMADOS">Diplomados</option>
              <option value="CURSOS_EMPRESARIALES">Cursos Empresariales</option>
            </select>
          </div>

          <div>
            <Label>Programa o curso *</Label>
            <select
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
              value={formData.programaOCurso}
              onChange={(e) => handleChange("programaOCurso", e.target.value)}
            >
              <option value="">Seleccione una opción</option>
              {opcionesPrograma.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {formData.tipoCertificado === "CURSOS_CICLICOS" &&
            CURSOS_INTERNOS[formData.programaOCurso] && (
              <div>
                <Label>Curso específico *</Label>
                <select
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                  value={cursoInterno}
                  onChange={(e) => setCursoInterno(e.target.value)}
                >
                  <option value="">Seleccione un curso</option>
                  {CURSOS_INTERNOS[formData.programaOCurso].map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {formData.tipoCertificado === "CURSOS_EMPRESARIALES" && (
            <div>
              <Label>Intensidad horaria *</Label>
              <select
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                value={horasCurso ?? ""}
                onChange={(e) =>
                  setHorasCurso(e.target.value as "8" | "12" | "32")
                }
              >
                <option value="">Seleccione la intensidad horaria</option>
                <option value="8">8 horas</option>
                <option value="12">12 horas</option>
                <option value="32">32 horas</option>
                <option value="35">35 horas</option>
                <option value="48">48 horas</option>
              </select>
            </div>
          )}

          <div>
            <Label>Fecha del certificado (opcional)</Label>
            <Input
              type="date"
              className="focus-visible:ring-[#cc0000]"
              value={formData.fechaCertificado || ""}
              onChange={(e) =>
                handleChange("fechaCertificado", e.target.value)
              }
            />
          </div>

          <div>
            <Label>Folio manual (opcional)</Label>
            <Input
              type="number"
              value={formData.folio ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  folio: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />
          </div>

          {formData.folio && (
            <div>
              <Label>Libro manual *</Label>
              <Input
                value={formData.libro ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    libro: e.target.value,
                  }))
                }
                placeholder="Ej: 5"
              />
            </div>
          )}

          <Button className="w-full bg-[#cc0000] hover:bg-[#e60000] text-white" onClick={() => {
            setAccionPendiente("single");
            setShowCodigoDialog(true);
          }}>
            Generar Certificado
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#CC0000]">
            <Upload className="h-5 w-5 text-[#CC0000]" />
            Carga Masiva
          </CardTitle>
          <CardDescription>
            CSV o Excel
          </CardDescription>
        </CardHeader>

        <CardContent>
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer">
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click o arrastre el archivo
            </span>
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
            />
          </label>
        </CardContent>
      </Card>
      <Dialog open={isProcessing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generando certificados</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{progressText}</p>
            <Progress value={progress} className="[&>div]:bg-[#cc0000]" />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCodigoDialog} onOpenChange={setShowCodigoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Código institucional</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ingrese el código para autorizar la generación de certificados
            </p>

            <Input
              type="password"
              placeholder="Código institucional"
              value={codigoInstitucional}
              onChange={(e) => setCodigoInstitucional(e.target.value)}
            />

            <Button
              className="w-full bg-[#cc0000] hover:bg-[#e60000] text-white"
              onClick={() => {
                if (!codigoInstitucional) {
                  toast({
                    title: "Código requerido",
                    description: "Debe ingresar el código institucional",
                    variant: "destructive",
                  });
                  return;
                }

                setShowCodigoDialog(false);

                if (accionPendiente === "masivo" && archivoPendiente) {
                  procesarArchivoMasivo(archivoPendiente);
                } else if (accionPendiente === "single") {
                  handleGenerateSingle();
                }


                setAccionPendiente(null);
              }}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
