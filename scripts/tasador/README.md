# Datos del tasador

`src/lib/tasador/barrios.ts` es AUTO-GENERADO. No editarlo a mano salvo para
corregir un nombre o sumar un barrio nuevo.

Fuentes:
- **Barrios**: OpenStreetMap vía Overpass API (`place=suburb|neighbourhood|quarter`
  + `landuse=residential` dentro de los límites administrativos de Funes y Roldán),
  filtrados a la región (lat -32.7..-33.1 / lon -60.6..-61.1) para descartar
  homónimos de España.
- **Precio de tierra (ppm2)**: promedio de USD/m² de los terrenos en venta del
  feed HILO cuyo texto de ubicación matchea el nombre del barrio. Si un barrio
  no tiene muestras propias, la landing usa el promedio de la ciudad
  (`PPM2_CIUDAD`) y ensancha el rango de la estimación.
- **Costo de construcción**: NO se guarda acá. Sale de `lib/costos-construccion`
  (matriz Llave en Mano base jun-2026 ajustada por IPC), la misma fuente que la
  Calculadora de Costos de /recursos.

Para regenerar tras un cambio grande de inventario, correr la consulta Overpass
y recalcular los promedios contra el feed (ver historial del commit inicial).
