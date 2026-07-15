-- DATOS DE DEMOSTRACIÓN
-- Reemplaza direcciones, teléfonos, horarios y fuentes con información oficial antes de producción.

BEGIN;

-- Permite volver a ejecutar el seed sin duplicar los registros demostrativos.
DELETE FROM public.health_services
WHERE name IN (
  'Hospital de referencia de Manta (DEMO)',
  'Centro de salud comunitario (DEMO)',
  'Laboratorio clínico aliado (DEMO)'
);

DELETE FROM public.approved_health_content
WHERE topic IN ('acceso_servicios', 'dengue_prevencion', 'accesibilidad');

DELETE FROM public.health_question_config
WHERE field_name IN ('location', 'symptom_duration', 'companionship', 'accessibility');

INSERT INTO public.health_services
(name, institution_type, service_type, city, sector, address, phone, schedule, emergency_available, specialties, accessibility_features, requirements, source_name, source_reference, verified_at)
VALUES
('Hospital de referencia de Manta (DEMO)', 'Público', 'Emergencia y atención hospitalaria', 'Manta', 'Centro', 'DIRECCIÓN PENDIENTE DE VERIFICAR', 'ECU 911 para emergencias', 'Emergencias 24 horas; confirmar con la institución', TRUE, '["Emergencia","Medicina general"]'::jsonb, '["Acceso para movilidad reducida"]'::jsonb, '["Documento de identidad si está disponible"]'::jsonb, 'Registro demostrativo, reemplazar por fuente oficial', NULL, DATE '2026-07-15'),
('Centro de salud comunitario (DEMO)', 'Público', 'Consulta general y prevención', 'Manta', 'Tarqui', 'DIRECCIÓN PENDIENTE DE VERIFICAR', 'TELÉFONO PENDIENTE', 'HORARIO PENDIENTE', FALSE, '["Medicina general","Vacunación","Control preventivo"]'::jsonb, '["Atención prioritaria"]'::jsonb, '["Documento de identidad","Confirmar requisitos"]'::jsonb, 'Registro demostrativo, reemplazar por fuente oficial', NULL, DATE '2026-07-15'),
('Laboratorio clínico aliado (DEMO)', 'Privado', 'Laboratorio clínico', 'Manta', 'Los Esteros', 'DIRECCIÓN PENDIENTE DE VERIFICAR', 'TELÉFONO PENDIENTE', 'HORARIO PENDIENTE', FALSE, '["Exámenes de laboratorio"]'::jsonb, '["Ingreso accesible"]'::jsonb, '["Orden médica cuando corresponda","Consultar preparación previa"]'::jsonb, 'Registro demostrativo, reemplazar por fuente oficial', NULL, DATE '2026-07-15');

INSERT INTO public.approved_health_content
(topic, title, content, keywords, source_organization, source_document, source_reference, version, approval_status, verified_at)
VALUES
('acceso_servicios', 'Cómo preparar una consulta', 'Antes de acudir, organiza el motivo de consulta, cuánto tiempo lleva, antecedentes relevantes y medicamentos que utilizas. Confirma directamente con la institución el horario y los requisitos.', '["cita","consulta","documentos","requisitos"]'::jsonb, 'Manta Cuida IA', 'Contenido demostrativo para la buildathon', NULL, '1.0', 'approved', DATE '2026-07-15'),
('dengue_prevencion', 'Prevención comunitaria del dengue', 'Elimina recipientes con agua estancada, mantén tapados los depósitos y utiliza medidas de protección contra mosquitos. Este contenido es preventivo y no reemplaza una valoración profesional.', '["dengue","mosquitos","prevencion","agua estancada"]'::jsonb, 'Manta Cuida IA', 'Contenido demostrativo; reemplazar por material institucional', NULL, '1.0', 'approved', DATE '2026-07-15'),
('accesibilidad', 'Orientación paso a paso', 'Para personas con barreras digitales, divide el trámite en pasos cortos, confirma cada paso y ofrece alternativas de contacto humano cuando estén disponibles.', '["adulto mayor","accesibilidad","barrera digital","paso a paso"]'::jsonb, 'Manta Cuida IA', 'Guía de accesibilidad del prototipo', NULL, '1.0', 'approved', DATE '2026-07-15');

INSERT INTO public.health_question_config
(field_name, question_text, answer_options, rationale, intent, priority_level, sort_order)
VALUES
('location', '¿En qué sector de Manta te encuentras?', '[]'::jsonb, 'Permite buscar servicios cercanos.', 'SERVICE_SEARCH', 'ANY', 10),
('symptom_duration', '¿Desde cuándo comenzó lo que describes?', '["Hace minutos","Hoy","Hace varios días","Hace semanas"]'::jsonb, 'Ayuda a estructurar el caso sin emitir diagnóstico.', 'TRIAGE', 'ANY', 20),
('companionship', '¿Estás acompañado en este momento?', '["Sí","No"]'::jsonb, 'Pregunta prioritaria ante una posible emergencia.', 'EMERGENCY', 'EMERGENCY', 1),
('accessibility', '¿Necesitas que te lo explique paso a paso, con texto grande o lectura en voz alta?', '["Paso a paso","Texto grande","Lectura en voz alta","No"]'::jsonb, 'Adapta la experiencia a barreras de acceso.', 'ACCESSIBILITY_HELP', 'ANY', 30);

COMMIT;
