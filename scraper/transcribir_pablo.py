#!/usr/bin/env python3
"""
transcribir_pablo.py
Transcribe los audios .ogg de Pablo Moche usando Whisper
"""

import whisper
import os
from datetime import datetime
import sys

MODELO = "medium"
DIRECTORIO = os.path.expanduser("~/Downloads/pablo")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "audios")

def transcribir_archivo(model, archivo):
    """Transcribe un archivo de audio y guarda el resultado"""

    ruta_completa = os.path.join(DIRECTORIO, archivo)

    if not os.path.exists(ruta_completa):
        print(f"  No encontrado: {ruta_completa}")
        return False

    nombre = os.path.splitext(archivo)[0]

    print(f"\n{'='*60}")
    print(f"  Transcribiendo: {archivo}")
    print(f"  Modelo: {MODELO}")
    print(f"{'='*60}\n")

    try:
        inicio = datetime.now()
        result = model.transcribe(
            ruta_completa,
            language="es",
            verbose=True,
            task="transcribe",
            fp16=False
        )
        fin = datetime.now()
        duracion = (fin - inicio).total_seconds()

        output_file = os.path.join(OUTPUT_DIR, f"{nombre}.txt")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"# Audio: {archivo}\n")
            f.write(f"# Transcrito: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
            f.write(f"# Modelo Whisper: {MODELO}\n")
            f.write(f"# Tiempo de procesamiento: {int(duracion/60)} min {int(duracion%60)} seg\n")
            f.write(f"\n{'='*60}\n\n")
            f.write(result["text"])

        print(f"\n  Guardado: {output_file}")
        print(f"  Tiempo: {int(duracion/60)} min {int(duracion%60)} seg")

        palabras = len(result["text"].split())
        print(f"  Estadisticas: {palabras} palabras")

        return True

    except Exception as e:
        print(f"  Error transcribiendo {archivo}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("="*60)
    print("  TRANSCRIPCION - Audios Pablo Moche")
    print("="*60)

    if not os.path.exists(DIRECTORIO):
        print(f"  Directorio no encontrado: {DIRECTORIO}")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Buscar archivos .ogg
    archivos = sorted([f for f in os.listdir(DIRECTORIO) if f.endswith('.ogg')])

    if not archivos:
        print("  No se encontraron archivos .ogg")
        sys.exit(1)

    print(f"\n  Archivos encontrados: {len(archivos)}")
    for a in archivos:
        size_kb = os.path.getsize(os.path.join(DIRECTORIO, a)) / 1024
        print(f"    - {a} ({size_kb:.0f} KB)")

    # Cargar modelo Whisper
    print(f"\n  Cargando modelo Whisper '{MODELO}'...")

    try:
        model = whisper.load_model(MODELO)
        print("  Modelo cargado\n")
    except Exception as e:
        print(f"  Error cargando modelo: {str(e)}")
        sys.exit(1)

    # Transcribir
    inicio_total = datetime.now()
    resultados = []

    for i, archivo in enumerate(archivos, 1):
        print(f"\n  Procesando audio {i}/{len(archivos)}")
        exito = transcribir_archivo(model, archivo)
        resultados.append((archivo, exito))

    fin_total = datetime.now()
    duracion_total = (fin_total - inicio_total).total_seconds()

    # Resumen
    print("\n" + "="*60)
    print("  RESUMEN")
    print("="*60)

    exitosos = sum(1 for _, exito in resultados if exito)
    total = len(resultados)

    for archivo, exito in resultados:
        estado = "OK" if exito else "FAIL"
        print(f"  [{estado}] {archivo}")

    print(f"\n  Total: {exitosos}/{total}")
    print(f"  Tiempo total: {int(duracion_total/60)} min {int(duracion_total%60)} seg")
    print(f"  Output: {OUTPUT_DIR}")
    print("="*60)

if __name__ == "__main__":
    main()
