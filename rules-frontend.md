# 📘 Reglas de Desarrollo Frontend - Proyecto UMG Parqueo

## 🎯 Objetivo
Este documento define las reglas obligatorias que debe seguir el frontend (React + Bootstrap) para mantener consistencia visual, técnica y estructural según la guía de diseño institucional.

---

# 🎨 1. PALETA DE COLORES (OBLIGATORIO)

## 🔵 Colores principales
:root {
  --azul-oscuro: #1F4E79;
  --azul-marino: #003366;
  --azul-universitario: #1A6AA6;
  --celeste-v1: #20A4D6;
  --celeste-v2: #00CCFF;
  --rojo: #C7352E;
}

## ⚪ Colores de fondo
:root {
  --fondo-general: #F2F2F2;
  --blanco: #FFFFFF;
  --celeste-claro: #A7C9D6;
  --celeste-palido: #CCF2FF;
}

## 🚨 Reglas
- ❌ NO usar colores fuera de esta paleta
- ✅ Azul universitario → botones e interacción
- ✅ Rojo → errores o alertas críticas
- ✅ Fondo claro siempre

---

# 🔤 2. TIPOGRAFÍA (OBLIGATORIO)

## 🧾 Contenido general
- Fuente: Century Gothic

## 🏷️ Títulos
- Fuente: Ubuntu Italic

## ✍️ Decorativo
- Fuente: Brittany (solo decorativo)

---

# 🧩 3. ESTRUCTURA

<Layout>
  <Header />
  <Main />
  <Footer />
</Layout>

---

# 🧱 4. COMPONENTES

Botones:
- Fondo azul
- Texto blanco

Cards:
- Fondo blanco
- Sombra ligera

---

# 🎯 5. ICONOS
- Estilo lineal
- Mínimo 24px
- Azul para interacción
- Rojo para errores

---

# 🚀 6. BUENAS PRÁCTICAS

Estructura:

src/
 ├── components/
 ├── pages/
 ├── layouts/
 ├── services/
 ├── styles/

---

# ❌ PROHIBIDO
- Cambiar colores
- Cambiar tipografía
- Romper diseño

---

# 🧠 PARA CODEX
Seguir estrictamente estas reglas al generar código.
