# RichText Editor

Editor WYSIWYG simple y funcional en JavaScript vanilla.

## Descripción

Editor de texto enriquecido con interfaz moderna que permite formatear contenido, insertar imágenes y videos de YouTube. Desarrollado con JavaScript ES6 y Bootstrap 5, sin dependencias externas.

**Características:**
- Formato de texto (negrita, cursiva, tachado)
- Selección de fuentes y tamaños
- Alineación de texto
- Listas ordenadas y desordenadas
- Inserción de enlaces e imágenes
- Redimensionamiento de imágenes mediante overlay flotante
- Inserción de videos de YouTube responsive
- Modo código fuente
- Modo pantalla completa

## Requerimientos

- Navegador moderno con soporte ES6
- Bootstrap 5
- Bootstrap Icons

## Instalación

```bash
git clone https://github.com/RichardCollao/RichText.git
cd RichText
```

## Inicio Rápido

### 1. Incluir archivos necesarios

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
    
    <!-- RichText CSS -->
    <link type="text/css" rel="stylesheet" href="css/RichText.css" />
</head>
<body>
    <div id="editor"></div>

    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- RichText JS -->
    <script src="js/RichText.js"></script>
</body>
</html>
```

### 2. Inicializar el editor

```javascript
let richTextEditor = new RichText('editor', {
    height: '500px',
    placeholder: 'Escribe algo aquí...'
});
```

### 3. Obtener y establecer contenido

```javascript
// Obtener contenido HTML
let contenido = richTextEditor.editor.innerHTML;

// Establecer contenido HTML
richTextEditor.editor.innerHTML = '<p>Contenido inicial</p>';
```

## Configuración

### Opciones del constructor

```javascript
new RichText('containerId', {
    height: '400px',              // Altura mínima del editor (default: '400px')
    placeholder: 'Escribe algo...' // Texto placeholder (default: 'Escribe algo...')
});
```

## Funcionalidades

### Formato de texto

- **Negrita, cursiva y tachado**: Botones en la barra de herramientas
- **Fuentes**: Arial, Courier New, Georgia, Times New Roman, Trebuchet MS, Verdana
- **Tamaños**: 7 tamaños predefinidos (10px a 48px)
- **Color de texto**: Selector de color

### Alineación

- Izquierda
- Centro
- Derecha
- Justificado

### Listas

- Listas ordenadas
- Listas desordenadas
- Control de sangría

### Inserción de contenido

#### Enlaces

```javascript
// Se solicitará URL mediante prompt
// El texto seleccionado se convertirá en enlace
```

#### Imágenes

```javascript
// Se solicitará URL de la imagen
// La imagen se inserta y puede redimensionarse haciendo clic sobre ella
```


#### Videos de YouTube

```javascript
// Formatos de URL aceptados:
// - https://www.youtube.com/watch?v=VIDEO_ID
// - https://youtu.be/VIDEO_ID
// - https://www.youtube.com/embed/VIDEO_ID
```

El video se inserta con aspect ratio 16:9 responsive.

### Modos especiales

- **Código fuente**: Edita el HTML directamente
- **Pantalla completa**: Expande el editor a toda la ventana
- **Limpiar formato**: Elimina todo el formato del texto seleccionado

## API JavaScript

### Métodos principales

```javascript
// Obtener contenido
let html = richTextEditor.editor.innerHTML;

// Establecer contenido
richTextEditor.editor.innerHTML = '<p>Nuevo contenido</p>';

// Limpiar editor
richTextEditor.editor.innerHTML = '';

// Cambiar a modo código fuente
richTextEditor.switchToSourceMode();

// Cambiar a modo visual
richTextEditor.switchToVisualMode();

// Pantalla completa
richTextEditor.toggleFullscreen();
```

## Estructura del proyecto

```
RichText/
├── css/
│   └── RichText.css          # Estilos del editor
├── js/
│   └── RichText.js           # Clase principal del editor
├── examples/
│   └── example.html          # Ejemplo de uso
└── README.md
```

## Ejemplo completo

Ver `examples/example.html` para una implementación completa con todos los controles.

Para ejecutar el ejemplo localmente con un servidor:

```bash
cd examples
python3 -m http.server 8000
# Abre http://localhost:8000/example.html
```

### Compatibilidad

El editor utiliza `document.execCommand()` para la mayoría de operaciones de formato. Funciona en navegadores modernos pero esta API está siendo reemplazada gradualmente por alternativas más modernas.

## Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea un branch para tu feature
3. Commit tus cambios
4. Push al branch
5. Abre un Pull Request

## Licencia

Este proyecto está bajo licencia Creative Commons Reconocimiento-CompartirIgual 4.0 Internacional.

## Autor

Richard Collao - [GitHub](https://github.com/RichardCollao)

## Dependencias

- [Bootstrap 5](https://getbootstrap.com/) - Framework CSS
- [Bootstrap Icons](https://icons.getbootstrap.com/) - Iconografía
