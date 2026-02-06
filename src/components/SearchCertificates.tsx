import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { buscarCertificados, CertificadoResultado } from "@/services/buscarCertificados";
import { HistorialCertificado } from "@/services/obtenerHistorial";
import { Trash2 } from "lucide-react";
import { anularCertificado } from "@/services/anularCertificados";
import { obtenerHistorial } from "@/services/obtenerHistorial";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Props {
  historial: HistorialCertificado[];
}



type TipoCertificado =
  | "PROGRAMAS_TECNICO_LABORALES"
  | "CURSOS_CICLICOS"
  | "DIPLOMADOS"
  | "CURSOS_EMPRESARIALES";

export interface SearchFormData {
  cedula?: string;
  tipoCertificado?: TipoCertificado;
  programaOCurso?: string;
  cursoGeneral?: string;
}

/* ================== Catálogos ================== */

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
];

const CURSOS_INTERNOS: Record<string, string[]> = {
  "Home Care: Entrenamiento Integral para Cuidadores Domiciliarios": [
    "Cuidado al Adulto Mayor",
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
};

const DIPLOMADOS = [
  "Profundización en UCI para Auxiliares de Enfermería",
  "Facturación en Salud, Glosas, y Auditoría de Cuentas",
];

const CURSOS_EMPRESARIALES = [
  "Primeros Auxilios",
  "Entrenamiento a Brigadas de Emergencia",
  "Entrenamiento en Reanimación Cardiopulmonar",
  "Brigadas de Evacuación",
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
  "Minas Antipersonal"
]

/* ================== Componente ================== */

export const SearchCertificates = ({ historial }: Props) => {
  const { toast } = useToast();

  const [cedula, setCedula] = useState("");
  const [tipoCertificado, setTipoCertificado] =
    useState<TipoCertificado | "">("");
  const [programaSeleccionado, setProgramaSeleccionado] = useState("");
  const [cursoInterno, setCursoInterno] = useState("");
  const [resultados, setResultados] = useState<CertificadoResultado[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const [historialLocal, setHistorialLocal] =
  useState<HistorialCertificado[]>(historial);

  const [cedulaAEliminar, setCedulaAEliminar] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
  setHistorialLocal(historial);
  }, [historial]);

  const POR_PAGINA = 15;

  const historialSeguro = Array.isArray(historialLocal)
  ? historialLocal
  : [];

  const historialFiltrado = historialSeguro.filter((item) =>
    item.cedula.toString().includes(busqueda)
  );

  const totalPaginas = Math.ceil(historialFiltrado.length / POR_PAGINA);


  const registrosPagina = historialFiltrado.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA
  );

  const [seleccionados, setSeleccionados] = useState<HistorialCertificado[]>([]);

  const convertirADescargaDirecta = (url: string) => {
    const match = url.match(/\/d\/(.*?)\//);
    const id = match?.[1];

    if (!id) return url;

    return `https://drive.google.com/uc?export=download&id=${id}`;
  };

  const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

  const descargarSecuencial = async () => {
    if (seleccionados.length === 0) return;

    try {
      setLoading(true);

      for (const registro of seleccionados) {

        const payload = {
          cedula: registro.cedula.toString(),
          tipoCertificado: registro.tipo_certificado as TipoCertificado,
          programaOCurso: registro.programa,
        };

        const result = await buscarCertificados(payload);

        if (!result?.length) continue;

        const url = convertirADescargaDirecta(result[0].url);

        // 🔥 descarga permitida por el navegador
        window.open(url, "_blank");

        // ⏱️ delay CLAVE para evitar bloqueo
        await sleep(3500);
      }

      toast({
        title: "Descargas iniciadas",
        description: "Los certificados se están descargando uno por uno.",
      });

    } catch (error) {
      toast({
        title: "Error en la descarga",
        description: "Ocurrió un problema al descargar los certificados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSeleccionados([]);
    }
  };

  useEffect(() => {
    setProgramaSeleccionado("");
    setCursoInterno("");
  }, [tipoCertificado]);

  useEffect(() => {
    setCursoInterno("");
  }, [programaSeleccionado]);

  const opcionesPrograma =
    tipoCertificado === "PROGRAMAS_TECNICO_LABORALES"
      ? PROGRAMAS_TECNICOS
      : tipoCertificado === "CURSOS_CICLICOS"
      ? CURSOS_CICLICOS
      : tipoCertificado === "DIPLOMADOS"
      ? DIPLOMADOS
      : tipoCertificado === "CURSOS_EMPRESARIALES"
      ? CURSOS_EMPRESARIALES
      : [];

  const handleBuscar = async () => {
    // ❌ Validación clave
    if (!cedula && !programaSeleccionado) {
      toast({
        title: "Búsqueda inválida",
        description:
          "Debe ingresar al menos cédula o programa/curso para buscar.",
        variant: "destructive",
      });
      return;
    }

    if (tipoCertificado && !cedula && !programaSeleccionado) {
      toast({
        title: "Búsqueda inválida",
        description: "No se puede buscar solo por tipo de certificado.",
        variant: "destructive",
      });
      return;
    }

    const tieneCursoInterno =
      tipoCertificado === "CURSOS_CICLICOS" &&
      CURSOS_INTERNOS[programaSeleccionado] &&
      cursoInterno;

    const payload: SearchFormData = {
      cedula: cedula || undefined,
      tipoCertificado: tipoCertificado || undefined,
      programaOCurso: tieneCursoInterno
        ? cursoInterno
        : programaSeleccionado || undefined,
      cursoGeneral: tieneCursoInterno
        ? programaSeleccionado
        : undefined,
    };

    console.log("🔎 Payload búsqueda:", payload);

    try {
        setLoading(true);
        setResultados([]);

        const response = await buscarCertificados(payload);

        if (!response || response.length === 0) {
          toast({
            title: "Sin resultados",
            description:
              "No se encontraron certificados con los criterios ingresados.",
          });
          return;
        }

        setResultados(response);
        } catch (error) {
        toast({
            title: "Error en la búsqueda",
            description: "Ocurrió un error al buscar los certificados.",
            variant: "destructive",
        });
        } finally {
        setLoading(false);
        }
        };

        const confirmarAnulacion = async () => {
          if (!cedulaAEliminar) return;

          try {
            setEliminando(true);

            const response = await anularCertificado(cedulaAEliminar);

            if (!response.success) {
              toast({
                title: "No se pudo anular",
                description:
                  response.message || "El certificado no pudo ser anulado.",
                variant: "destructive",
              });
              return;
            }

            toast({
              title: "Certificado anulado",
              description: "El certificado fue anulado con éxito.",
            });

            // 🔄 volver a consultar historial
            const nuevoHistorial = await obtenerHistorial();
            setHistorialLocal(nuevoHistorial);

          } catch (error) {
            toast({
              title: "Error",
              description: "Ocurrió un error al anular el certificado.",
              variant: "destructive",
            });
          } finally {
            setEliminando(false);
            setCedulaAEliminar(null);
          }
        };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-[#CC0000]">Historial de certificados</CardTitle>
          <CardDescription>
            Total registros: {historialFiltrado.length}
          </CardDescription>
        </div>

        {seleccionados.length > 0 && (
          <Button
            className="bg-[#cc0000] text-white"
            onClick={descargarSecuencial}
            disabled={loading}
          >
            {loading
            ? "Descargando..."
            : `Descargar certificados (${seleccionados.length})`}
          </Button>
        )}

        <Input
          placeholder="Buscar por cédula..."
          className="w-60 focus-visible:ring-[#cc0000]"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
        />
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-[40px_110px_120px_1.5fr_1fr_1.5fr_120px_60px] gap-2 px-3 text-xs font-semibold text-muted-foreground">
        <span>Select</span>
        <span>Fecha</span>
        <span>Cédula</span>
        <span>Nombre</span>
        <span>Tipo</span>
        <span>Programa</span>
        <span>Libro / Folio</span>
        <span className="text-center">Acción</span>
      </div>
        {registrosPagina.map((item, index) => (
        <div
          key={`${item.cedula}-${item.libro}-${item.folio}`}
          className="grid grid-cols-[40px_110px_120px_1.5fr_1fr_1.5fr_120px_60px] gap-2 items-center border rounded-md p-3 text-sm"
        >
          {/* CHECKBOX */}
          <input
            type="checkbox"
            checked={seleccionados.some(
              s => s.libro === item.libro && s.folio === item.folio
            )}
            onChange={(e) => {
              if (e.target.checked) {
                setSeleccionados(prev => [...prev, item]);
              } else {
                setSeleccionados(prev =>
                  prev.filter(
                    s => !(s.libro === item.libro && s.folio === item.folio)
                  )
                );
              }
            }}
          />

          <span>{item.fecha}</span>

          {/* BOTÓN CÉDULA (sigue igual para vista individual) */}
          <Button
            variant="link"
            className="text-[#cc0000] p-0 justify-start"
            onClick={async () => {
              try {
                const payload = {
                  cedula: item.cedula.toString(),
                  tipoCertificado: item.tipo_certificado as TipoCertificado,
                  programaOCurso: item.programa,
                };

                const result = await buscarCertificados(payload);
                if (!result?.length) return;

                window.open(result[0].url, "_blank");
              } catch {}
            }}
          >
            {item.cedula}
          </Button>

          <span className="truncate" title={item.nombre}>{item.nombre}</span>
          <span className="truncate" title={item.tipo_certificado}>{item.tipo_certificado}</span>
          <span className="truncate" title={item.programa}>{item.programa}</span>
          <span>L{item.libro} - F{item.folio}</span>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#cc0000] hover:text-[#FFFFFF] hover:bg-[#cc0000] mx-auto"
                onClick={() => setCedulaAEliminar(item.cedula)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Anular certificado?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción anulará el certificado asociado a la cédula{" "}
                  <strong>{cedulaAEliminar}</strong>.  
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel
                  className="text-[#121212] hover:bg-[#e3e3e3] hover:text-[#121212]"
                  onClick={() => setCedulaAEliminar(null)}
                >
                  Cancelar
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={confirmarAnulacion}
                  disabled={eliminando}
                  className="bg-[#cc0000] hover:bg-[#aa0000]"
                >
                  {eliminando ? "Anulando..." : "Sí, anular"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            <Button
              variant="outline"
              className="hover:bg-[#cc0000]"
              disabled={pagina === 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </Button>

            <span className="text-sm self-center">
              Página {pagina} de {totalPaginas}
            </span>

            <Button
              variant="outline"
              className="hover:bg-[#cc0000]"
              disabled={pagina === totalPaginas}
              onClick={() => setPagina(pagina + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
