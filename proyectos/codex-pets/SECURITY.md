# Patitas Felices: checklist de publicacion segura

Esta pagina es estatica: no guarda correos, no procesa pagos y no envia formularios desde el navegador. El boton de cita usa `mailto`, por lo que el correo se abre en el cliente del usuario y no queda almacenado en el sitio.

## Antes de publicar

- Publicar solo por HTTPS.
- Usar un dominio y correo reales de la marca.
- No guardar emails, telefonos o mensajes en archivos del frontend.
- Si se agrega formulario, enviarlo a un backend seguro con validacion, proteccion anti-spam y consentimiento claro.
- Activar headers de seguridad en el hosting: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` y `frame-ancestors 'none'`.
- Mantener dependencias externas en cero o auditadas. Esta version no carga librerias de terceros.
- Revisar textos legales necesarios para datos personales: aviso de privacidad, uso de datos y canal de contacto.

## Datos personales

Para citas con correo electronico, la opcion mas segura es usar un proveedor de formularios o backend que:

- cifre la conexion con HTTPS,
- valide los campos en servidor,
- limite intentos de spam,
- guarde solo los datos necesarios,
- permita borrar o consultar solicitudes.
