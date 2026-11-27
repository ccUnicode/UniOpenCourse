# ADR-005: Integración de evaluaciones mediante Scraping Dinámico de Trikaweb

## Estado
Aceptado

## Contexto
El sistema requería mostrar las evaluaciones (PC1, PC2, EP, EF) de los cursos. Esta información ya existía y se actualizaba constantemente en la plataforma externa Trikaweb. Solicitar a los administradores que ingresaran y mantuvieran manualmente estos datos en nuestro sistema habría generado duplicidad de trabajo y desincronización de la información. Además, Trikaweb no ofrece una API REST pública para consumir estos datos de forma estructurada.

## Decisión
En lugar de crear tablas de evaluaciones complejas en la base de datos local, se decidió agregar un único campo `url_trikaweb` (String, opcional) en el modelo `Course`. 
En el backend, se implementó un servicio de **Scraping Dinámico** utilizando `axios` (para obtener el HTML) y `cheerio` (para parsear el DOM). Este servicio extrae en tiempo real las evaluaciones directamente desde la URL configurada por el administrador. Para proteger la infraestructura, se implementaron medidas de seguridad contra SSRF (bloqueo de redirecciones y validación estricta del prefijo de la URL de Trikaweb) y una caché en memoria para no saturar el servidor de origen con peticiones repetidas.

## Consecuencias
- **Ventajas:** Evita la duplicidad de datos, facilita el trabajo de los administradores y agiliza la integración de nuevos cursos (solo necesitan pegar un link).
- **Costos/Desventajas:** El scraping introduce una dependencia frágil; si Trikaweb cambia la estructura HTML de sus tablas en el futuro, el scraper fallará y deberá ser actualizado manualmente.
- **Consideraciones:** Se debe monitorear la tasa de peticiones para evitar ser bloqueados por Trikaweb. La caché local en el Frontend (`hasFetched` en los componentes) y el Backend mitigan fuertemente este riesgo.
