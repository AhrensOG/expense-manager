# Geneva Expense Manager - Especificaciones del Proyecto

## 1. Descripción del Proyecto

**Nombre:** Geneva Expense Manager (nombretentativo)
**Tipo:** Aplicación web (MVP) - Migración a móvil futura si es necesario
**Plataforma inicial:** Web (PWA opcional)
**Mercado objetivo:** Adultos en Suiza (Ginebra)
**Cliente:** Cliente de Ginebra, Suiza

## 2. Propósito

Desarrollar una aplicación de gestión de gastos similar a Money Manager pero:
- Mucho más intuitiva
- Simplificada (sin funcionalidades avanzadas excesivas)
- Enfocada en el mercado suizo

## 3. Público Objetivo

- Adultos en Suiza
- Usuarios que buscan simplicidad
- Personas que necesitan controlar gastos en la zona de Ginebra

## 4. Funcionalidades Principales

### 4.1 Core (Esenciales)
- Registro rápido de gastos (1-2 taps)
- Registro de ingresos
- Categorías de gastos predefinidas
- Resumen visual (diario, semanal, mensual)
- Moneda: CHF (Franco Suizo)

### 4.2 Funcionalidades Avanzadas (Bien Integradas)
- Gráficos visuales de gastos por categoría
- Presupuestos por categoría
- Vista de calendario con transacciones
- Fotos de recibos
- Gastos recurrentes (alquiler, seguros, suscripciones)
- Resumen semanal/mensual automático

### 4.3 Excluidas (vs Money Manager)
- Sistema de doble entrada contable
- Gestión compleja de múltiples cuentas
- Exportación/importación de datos
- Filtros avanzados
- Subcategorías complejas
- Configuraciones de inicio de mes

## 5. Diseño UX/UI

### 5.1 Principios
- **Simplicidad en la superficie**: interfaz limpia, mínimo clicks para acciones comunes
- **Potencia oculta**: funcionalidades avanzadas accesibles pero no invasivas
- **Animaciones**: permitidas si son cortas y mejoran la UX (no animaciones largas)
- **Minimalismo profesional**: sin elementos innecesarios

### 5.2 Características Visuales
- Diseño limpio y minimalista
- Profesional y serio (adecuado para adultos suizos)
- Sin gamificación
- Tema oscuro/disponible

### 5.3 Flujo Principal
1. Pantalla principal con resumen rápido
2. Botón de acción rápida para añadir gasto
3. Acceso a gráficos y estadísticas desde menú principal

## 6. Consideraciones Técnicas

- **Plataforma MVP:** Web (posteriormente móvil nativo/híbrido si es necesario)
- Moneda default: CHF
- Idiomas: EN, FR (configurado con next-intl)
- Internacionalización: **IMPLEMENTADO** (EN, FR)
- Funcionamiento offline (PWA) - **PENDIENTE** (dejado de lado por ahora)
- Posible sincronización cloud futura
- Backend: API REST o similar

## 7. Notas

- Las animaciones son bienvenidas si son cortas y mejoran la experiencia de usuario
- El enfoque está en la facilidad de uso para adultos
- Debe sentirse como una herramienta profesional, no como un juguete

---

**Fecha de creación:** 2026-03-11
**Estado:** En planificación
