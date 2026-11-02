# La libreta de Carla

Bullet journal en forma de libreta, con paso de página animado.

- Quien escribe entra en la web con la contraseña y edita directamente.
- Cualquiera puede verla con el enlace.

La web está en `public/` y el guardado en `netlify/functions/` (Netlify Functions + Netlify Blobs).
La contraseña de edición está en la variable de entorno `EDITOR_PASSWORD` de Netlify, no en el código.
