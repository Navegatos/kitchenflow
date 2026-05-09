# Frontend (KitchenFlow)

Interfaz web en **React 18** generada con **Vite 6**. El servidor de desarrollo escucha en el puerto **5173**.

## Ejecutar solo el front con Docker

Desde la raíz del repositorio (levanta también dependencias definidas en Compose: backend y postgres):

```bash
docker compose up --build front backend postgres
```

En el contenedor del front se define `VITE_API_URL=http://localhost:8000`. Si el navegador debe llamar a la API que corre en tu máquina (host), ese valor suele ser correcto porque el cliente corre en el navegador, no dentro del contenedor del front.

## Ejecutar solo el front en tu máquina

```bash
cd front
npm ci          # o npm install
npm run dev
```

Abre http://localhost:5173.

La API debe estar en marcha (por defecto en http://localhost:8000) si la aplicación hace peticiones al backend. Si más adelante el proyecto usa variables `VITE_*`, puedes crear un archivo `.env` en `front/` según la convención de Vite.

Otros scripts útiles:

```bash
npm run build    # compilación para producción → salida en dist/
npm run preview  # sirve la build localmente
```
