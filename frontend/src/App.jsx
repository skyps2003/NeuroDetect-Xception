import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, Activity, BrainCircuit, Loader2, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError("Por favor, sube un archivo de imagen válido.");
      return;
    }
    setError(null);
    setFile(selectedFile);
    setResult(null);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Ocurrió un error al procesar la imagen. Verifica que el servidor backend esté corriendo en localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  const getProbabilityColor = (prob, className) => {
    if (prob < 0.2) return 'bg-slate-600';
    if (className === 'No Tumor') return 'bg-emerald-500';
    return prob > 0.6 ? 'bg-medical-violet' : 'bg-medical-indigo';
  }

  return (
    <div className="min-h-screen bg-dark-bg text-slate-200 font-sans selection:bg-medical-indigo selection:text-white p-4 sm:p-8 flex items-center justify-center">

      <div className="max-w-5xl w-full mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10 mt-4">
          <div className="inline-flex items-center justify-center p-3 bg-card-bg rounded-2xl mb-4 border border-slate-700/50 shadow-lg">
            <BrainCircuit className="w-10 h-10 text-medical-violet mr-3" />
            <h1 className="text-3xl font-bold tracking-tight text-white">Neuro<span className="text-medical-indigo">Detect</span> AI</h1>
          </div>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Panel médico avanzado. Sistema de diagnóstico asistido por IA modelo Xception para la detección de tumores cerebrales en resonancias magnéticas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">

          {/* Upload Section */}
          <div className="flex flex-col h-full">
            <div
              onDragEnter={handleDragEnter}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex-1 group border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 min-h-[400px] overflow-hidden ${isDragActive ? 'border-medical-indigo bg-medical-indigo/10 scale-[1.01]' : 'border-slate-700 bg-card-bg hover:border-slate-500'
                }`}
            >

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />

              {!preview ? (
                <div className="text-center w-full h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-medical-indigo/20 transition-all duration-300 shadow-md">
                    <UploadCloud className={`w-10 h-10 transition-colors ${isDragActive ? 'text-medical-indigo' : 'text-slate-400 group-hover:text-medical-indigo'}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Arrastra tu resonancia aquí</h3>
                  <p className="text-slate-400 mb-6 text-sm">Escaneos T1/T2 MRI compatibles (Max 10MB)</p>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-full font-medium transition-colors text-sm shadow-md"
                  >
                    Seleccionar Archivo
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center relative z-10">
                  <div className="relative w-full flex-1 mb-6 rounded-xl overflow-hidden bg-black/50 border border-slate-700 flex items-center justify-center min-h-[250px]">
                    <img
                      src={preview}
                      alt="MRI Preview"
                      className="max-w-full max-h-[300px] object-contain relative z-0"
                    />
                    {/* Scanning Animation */}
                    {loading && (
                      <div className="absolute inset-x-0 w-full h-[3px] bg-medical-indigo shadow-[0_0_15px_#4f46e5,0_0_5px_#4f46e5] animate-[scan_2s_ease-in-out_infinite]" style={{ top: 0, zIndex: 10 }} />
                    )}
                  </div>

                  <div className="flex gap-4 w-full">
                    {!loading && !result && (
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-colors text-sm border border-slate-600 shadow-md"
                      >
                        Cambiar Imagen
                      </button>
                    )}

                    {!result && (
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center text-sm transition-all shadow-lg ${loading
                            ? 'bg-medical-indigo/50 text-indigo-200 cursor-not-allowed'
                            : 'bg-medical-indigo hover:bg-indigo-500 text-white hover:shadow-medical-indigo/25'
                          }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                            Analizando IA...
                          </>
                        ) : (
                          <>
                            <Activity className="w-5 h-5 mr-2" />
                            Iniciar Diagnóstico
                          </>
                        )}
                      </button>
                    )}

                    {result && (
                      <button
                        onClick={resetApp}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-colors text-sm border border-slate-600 shadow-md flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" /> Nuevo Análisis
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result Section */}
          <div className="flex flex-col h-full space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-5 flex items-start text-red-400">
                <AlertCircle className="w-6 h-6 mr-3 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-300">Error en el análisis</h4>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className={`flex-1 bg-card-bg rounded-3xl border border-slate-700 p-8 shadow-xl transition-all duration-500 ${result ? 'opacity-100 translate-y-0' : 'opacity-75 translate-y-2'}`}>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-4">
                  <Activity className="w-5 h-5 text-medical-violet" />
                </div>
                <h2 className="text-xl font-semibold text-white">Resultados del Análisis</h2>
              </div>

              {!result ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-slate-500">
                  <BrainCircuit className="w-16 h-16 opacity-20 mb-4" />
                  <p>Sube y procesa una imagen para</p>
                  <p>visualizar los resultados biométricos.</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Diagnosis Highlight */}
                  <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700/50">
                    <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Patología Predominante</p>
                    <div className="flex items-end justify-between">
                      <h3 className={`text-4xl font-bold tracking-tight ${result.prediction === 'No Tumor' ? 'text-emerald-400' : 'text-medical-indigo'}`}>
                        {result.prediction}
                      </h3>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">{(result.confidence * 100).toFixed(1)}</span>
                        <span className="text-slate-400 font-medium ml-1">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Bars */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Niveles de Confianza por Clase</h4>
                    <div className="space-y-5">
                      {Object.entries(result.probabilities)
                        .sort(([, a], [, b]) => b - a)
                        .map(([className, prob]) => {
                          const percentage = (prob * 100).toFixed(1);
                          return (
                            <div key={className} className="group">
                              <div className="flex justify-between text-sm mb-1.5">
                                <span className={className === result.prediction ? 'text-white font-medium' : 'text-slate-300'}>
                                  {className}
                                </span>
                                <span className="text-slate-400 font-medium">{percentage}%</span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getProbabilityColor(prob, className)}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- INCORPORADO: Footer de Copyright y Aviso Importante --- */}
        <div className="mt-14 w-full flex flex-col items-center">

          {/* Banner de Disclaimer Severo */}
          <div className="max-w-2xl w-full bg-amber-500/10 border border-amber-500/50 rounded-2xl p-5 mb-8 shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-center mb-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 mr-2 animate-pulse" />
              <h4 className="font-bold uppercase tracking-widest text-sm">Aviso Importante: Modo de Prueba</h4>
            </div>
            <div className="text-center text-amber-400/80 text-sm">
              <p className="mb-2 font-medium">Este sistema se encuentra en fase de desarrollo o pruebas.</p>
              <p className="text-xs">
                ⚠️ <strong className="text-amber-500">NO DEVEE CONFIAR DE MANERA DEFINITIVA EN ESTOS RESULTADOS.</strong>
                {' '}La aplicación está diseñada con fines académicos y experimentales. Los diagnósticos emitidos por este modelo de Inteligencia Artificial de ninguna forma sustituyen el análisis y dictamen médico de un profesional especializado.
              </p>
            </div>
          </div>

          {/* Copyright GRIAAP */}
          <div className="text-center border-t border-slate-700/30 pt-6 pb-4 w-full">
            <p className="text-slate-400 font-medium tracking-wide">
              © UNAMBA
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Grupo de Investigación Inteligencia Artificial y sus Aplicaciones - GRIAAP
            </p>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}

export default App;
