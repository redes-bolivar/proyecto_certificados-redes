import { useState } from "react";
import { CertificateForm, CertificateData } from "@/components/CertificateForm";
import { SearchCertificates } from "@/components/SearchCertificates";
import { downloadMultipleCertificates } from "@/utils/pdfGenerator2";
import { useToast } from "@/hooks/use-toast";
import { Award, FileCheck } from "lucide-react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { obtenerHistorial, HistorialCertificado } from "@/services/obtenerHistorial";

const Index = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [historial, setHistorial] = useState<HistorialCertificado[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [view, setView] = useState<"GENERAR" | "HISTORIAL">("GENERAR");

  const handleGenerate = async (data: CertificateData[]) => {
    setIsGenerating(true);
    
    try {
      downloadMultipleCertificates(data);
      
      toast({
        title: "Certificados generados",
        description: `Se ${data.length === 1 ? "ha generado" : "han generado"} ${data.length} certificado(s) exitosamente.`,
      });
    } catch (error) {
      toast({
        title: "Error al generar certificados",
        description: "Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsGenerating(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          
          {/* Izquierda: icono + título */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F3F3F3]">
              <Award className="h-8 w-8 text-[#CC0000]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#CC0000]">
                Generador de Certificados
              </h1>
              <p className="text-muted-foreground">
                ¡Crea certificados profesionales en un solo click!
              </p>
            </div>
          </div>

          {/* Derecha: botón */}
          <Button
            className="flex gap-2 bg-[#cc0000] hover:bg-[#e60000] text-white"
            onClick={async () => {
              // 👉 Si estoy en historial, vuelvo a generar
                  if (view === "HISTORIAL") {
                  setHistorial([]);
                  setView("GENERAR");
                  return;
                }
              // 👉 Si estoy generando, voy al historial
              try {
                setLoadingHistorial(true);
                const data = await obtenerHistorial();
                setHistorial(data);
                setView("HISTORIAL");
              } catch (error) {
                toast({
                  title: "Error",
                  description: "No se pudo cargar el historial de certificados",
                  variant: "destructive",
                });
              } finally {
                setLoadingHistorial(false);
              }
            }}
          >
            {view === "HISTORIAL" ? (
              <>
                <FileCheck className="h-4 w-4" />
                Generar Certificados
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Buscar Certificados
              </>
            )}
          </Button>

        </div>
      </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="lg:col-span-2">
              {view === "GENERAR" ? (
                <CertificateForm onGenerate={handleGenerate} />
              ) : (
                <SearchCertificates historial={historial} />
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#CC0000]">
                <FileCheck className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Características</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#CC0000]">✓</span>
                  <span>Diseño profesional y elegante</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#CC0000]">✓</span>
                  <span>Fecha automática de expedición</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#CC0000]">✓</span>
                  <span>Guardado automático en Drive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#CC0000]">✓</span>
                  <span>Generación individual o masiva por CSV/Excel</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg border border-dashed p-6 space-y-3">
              <h3 className="font-semibold text-sm text-foreground">
                Formato CSV o Excel
              </h3>

              <p className="text-xs text-muted-foreground">
                Descargue la plantilla, complete los datos y suba el archivo.
              </p>

              <a
                href="https://docs.google.com/spreadsheets/d/1Qk0EHsv72lSyZgBV2SeopE5tB_ELGavTdWjeqbprps8/edit?usp=sharing"
                download
                target="_blank"
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-md
                  bg-[#cc0000] hover:bg-[#e60000] text-white
                  px-4 py-2
                  text-xs font-medium text-primary-foreground
                  shadow-sm
                  transition-all
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                "
              >
                Descargar plantilla de Excel
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Generador Automático de Certificados © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
