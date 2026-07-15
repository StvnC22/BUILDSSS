# Seguridad y límites

## Reglas de producto

- No diagnosticar.
- No prescribir ni indicar dosis.
- No suspender tratamientos.
- No garantizar que una condición es leve.
- No inventar servicios, horarios, cupos o fuentes.
- No afirmar que una alerta fue enviada a una institución si la integración no existe.

## Doble control

1. Un nodo de código detecta expresiones críticas antes de GPT-5.6.
2. El formateador final vuelve a imponer prioridad `EMERGENCY` cuando la regla determinística la detectó.

GPT-5.6 puede elevar la prioridad, pero no reducir una emergencia determinística.

## Datos

- Solicitar únicamente información necesaria.
- Separar perfil de usuario y caso.
- Aplicar RLS.
- No usar `service_role` en el navegador.
- Mantener trazabilidad de acciones humanas.
- Anonimizar datos al generar estadísticas.

## Limitación del prototipo

El seed contiene datos demostrativos. Antes de producción se requiere validación institucional, revisión legal, revisión clínica y una política formal de privacidad y conservación de datos.
