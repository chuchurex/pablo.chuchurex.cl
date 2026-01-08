# pablomoche.cl - Contexto

> **Actualizado:** 4 Enero 2026
> **Estado:** Pausado (30%)
> **Fase:** Esperando cliente

---

## Resumen

Sitio web para Pablo Moche (artista). Proyecto React/Vite pausado hasta reactivación por el cliente.

---

## Estado Actual

- **Fase:** Pausado
- **Progreso:** 30%
- **Último deploy:** N/A
- **URL prod:** pablomoche.cl (pendiente)
- **URL local:** http://localhost:3006

---

## Arquitectura

```
React + Vite
├── pablo-reborn/   → Código fuente
└── Cloudflare Pages (futuro)
```

---

## Comandos

```bash
cd pablo-reborn
npm install
npm run dev
```

---

## Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| pablo-reborn/ | Proyecto Vite/React |
| pablo-reborn/vite.config.ts | Config puerto 3006 |
| docs/ARQUITECTURA.md | Arquitectura documentada |

---

## Historial de Cambios

### 2026-01-04 - docs: CONTEXT.md
- Creado archivo de contexto estandarizado
- Archivos: CONTEXT.md

### 2025-XX-XX - feat: Setup inicial
- Proyecto React/Vite creado
- Estructura básica
- Archivos: pablo-reborn/*

---

## Próximos Pasos (cuando se reactive)

- [ ] Crear CI/CD con GitHub Actions
- [ ] Agregar _headers con CSP
- [ ] Configurar dominio en CF Pages
- [ ] Completar diseño y contenido

---

*Protocolo de contexto activo - Ver ~/Sites/vigentes/PROTOCOLO-CONTEXTO.md*
