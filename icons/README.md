# Carpeta de Iconos / Emojis Personalizados

Esta carpeta está destinada a almacenar emojis/iconos personalizados para usar con el editor RichText.

## Formato de archivos

- **Formato recomendado**: PNG con fondo transparente
- **Tamaño recomendado**: 32x32 píxeles o 64x64 píxeles
- **Nombres de archivo**: Deben coincidir con los definidos en `getEmojiList()` en `RichText.js`

## Lista de emojis personalizados soportados

El editor espera los siguientes archivos de imagen en esta carpeta cuando se usa `emojiSet: 'custom'`:

### Caras y emociones
- `smile.png` - Cara sonriente
- `grin.png` - Cara con gran sonrisa
- `joy.png` - Cara con lágrimas de alegría
- `heart_eyes.png` - Cara con ojos de corazón
- `laughing.png` - Cara riendo
- `blush.png` - Cara sonrojada
- `wink.png` - Cara guiñando un ojo
- `kissing_heart.png` - Cara enviando un beso
- `relaxed.png` - Cara relajada
- `stuck_out_tongue_winking_eye.png` - Cara sacando lengua y guiñando
- `sunglasses.png` - Cara con lentes de sol
- `thinking.png` - Cara pensativa

### Gestos
- `thumbsup.png` - Pulgar arriba
- `thumbsdown.png` - Pulgar abajo
- `clap.png` - Aplausos
- `ok_hand.png` - Gesto OK
- `pray.png` - Manos rezando
- `muscle.png` - Músculo/fuerza
- `raised_hands.png` - Manos levantadas
- `point_up.png` - Señalando arriba
- `point_down.png` - Señalando abajo
- `point_left.png` - Señalando izquierda
- `point_right.png` - Señalando derecha
- `v.png` - Señal de victoria
- `wave.png` - Saludo con la mano

### Símbolos y objetos
- `heart.png` - Corazón
- `fire.png` - Fuego
- `star.png` - Estrella
- `sparkles.png` - Brillos/destellos
- `tada.png` - Celebración
- `rocket.png` - Cohete
- `100.png` - 100%
- `ok.png` - OK
- `trophy.png` - Trofeo
- `medal.png` - Medalla
- `crown.png` - Corona
- `gift.png` - Regalo
- `balloon.png` - Globo

### Naturaleza
- `eyes.png` - Ojos
- `see_no_evil.png` - Mono no ver
- `hear_no_evil.png` - Mono no oír
- `speak_no_evil.png` - Mono no hablar
- `rainbow.png` - Arcoíris
- `sunny.png` - Sol
- `cloud.png` - Nube
- `umbrella.png` - Paraguas
- `snowflake.png` - Copo de nieve
- `zap.png` - Rayo

## Uso

### Configurar emojis personalizados

```javascript
let richTextEditor = new RichText('editor', {
    height: '500px',
    placeholder: 'Escribe algo...',
    emojiSet: 'custom',                    // Activar emojis personalizados
    customEmojiPath: 'icons/'              // Ruta a la carpeta de iconos
});
```

### Usar emojis por defecto (Unicode)

```javascript
let richTextEditor = new RichText('editor', {
    height: '500px',
    placeholder: 'Escribe algo...',
    emojiSet: 'default'                    // Emojis Unicode (predeterminado)
});
```

## Notas

- Si usas `emojiSet: 'custom'` pero los archivos no existen, los emojis no se mostrarán correctamente
- Puedes encontrar packs de emojis gratuitos en sitios como [Twemoji](https://github.com/twitter/twemoji) o [OpenMoji](https://openmoji.org/)
- Asegúrate de que todos los archivos tengan los nombres exactos especificados arriba
- Los emojis personalizados se insertan como imágenes `<img>` en el contenido del editor
