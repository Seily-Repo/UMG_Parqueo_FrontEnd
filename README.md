# UMG Parqueo Frontend

Sistema de gestión de parqueo universitario para la Universidad Mariano Gálvez. El módulo **Parking Payment System** (originalmente exportado desde Figma) está integrado como módulo interno del proyecto principal bajo `src/modules/parking/`.

## Estructura del módulo de parqueo

```
src/modules/parking/
├── app/
│   ├── App.tsx               # Layout raíz del módulo
│   ├── routes.ts             # Definición de rutas
│   ├── context/              # Estado global (registro, parking)
│   ├── components/           # Componentes compartidos y UI (shadcn)
│   └── pages/
│       ├── user/             # Flujo estudiantil
│       │   ├── UserStart
│       │   ├── PersonalData
│       │   ├── VehicleData
│       │   ├── Payment
│       │   ├── Signature
│       │   └── Confirmation
│       └── admin/            # Panel administrativo
│           ├── AdminLogin
│           ├── AdminDashboard
│           └── RegistrationDetail
└── styles/                   # CSS del módulo
```

## Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page principal |
| `/parking` | Entrada al módulo de parqueo |
| `/parking/user` | Inicio del flujo estudiantil |
| `/parking/user/datos-personales` | Paso 1: datos personales |
| `/parking/user/vehiculos` | Paso 2: vehículos |
| `/parking/user/pago` | Paso 3: pago |
| `/parking/user/firma` | Paso 4: firma digital |
| `/parking/user/confirmacion` | Paso 5: confirmación |
| `/parking/admin` | Login administrativo |
| `/parking/admin/dashboard` | Panel admin |
| `/parking/admin/dashboard/registro/:id` | Detalle de registro |

---

## Correr en local (sin Docker)

### Primera vez

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La app queda disponible en `http://localhost:3000`.

### Build de producción

```bash
npm run build
```

### Preview del build

```bash
npm run preview
```

---

## Docker

### DEV

#### Primera vez (construye la imagen)

```bash
docker compose -f docker-compose.dev.yml up --build
```

#### Día a día (sin reconstruir)

```bash
docker compose -f docker-compose.dev.yml up
```

### PROD

#### Linux / macOS

```bash
DOCKER_BUILDKIT=1 docker compose -f docker-compose.prod.yml up --build -d
```

#### Windows PowerShell

```powershell
$env:DOCKER_BUILDKIT=1; docker compose -f docker-compose.prod.yml up --build -d
```

---

## Créditos

El diseño original de Parking Payment System proviene de [Figma](https://www.figma.com/design/cyqXVHSpbKMIVzfWlumW2U/Parking-Payment-System).

Componentes UI basados en [shadcn/ui](https://ui.shadcn.com/) bajo [licencia MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

Fotografías de [Unsplash](https://unsplash.com) bajo su [licencia](https://unsplash.com/license).
