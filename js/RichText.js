/**
 * RichText Editor - Clase ES6
 * Un editor WYSIWYG simple y funcional
 */
class RichText {
    constructor(containerId, options = {}) {
        console.log('RichText: constructor', containerId);
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }

        this.options = {
            height: options.height || '400px',
            placeholder: options.placeholder || 'Escribe algo...',
            emojiSet: options.emojiSet || 'default', // 'default' o 'custom'
            customEmojiPath: options.customEmojiPath || 'icons/', // ruta a emojis personalizados
            customEmojiList: options.customEmojiList || null, // ruta al archivo JSON con la lista de emojis
            ...options
        };

        this.isSourceMode = false;
        this.selectedImage = null;
        // Datos para overlay de redimensionado basado en overlay flotante
        this.imageResizeOverlay = null; // overlay único por editor
        this.resizeData = null; // datos de drag actuales
        this.emojiPopover = null; // popover de emojis
        this.customEmojis = null; // cache de emojis personalizados cargados desde JSON
        this.init();
    }

    init() {
        console.log('RichText: init');
        this.createEditor();
        this.attachEvents();
        this.attachImageEvents();
    }

    createEditor() {
        console.log('RichText: createEditor');
        this.container.innerHTML = `
            <div class="rich-text-editor border rounded bg-white shadow-sm">
                ${this.createToolbar()}
                ${this.createEditableArea()}
            </div>
        `;

        this.toolbar = this.container.querySelector('.rich-text-toolbar');
        this.editor = this.container.querySelector('.rich-text-content');
        this.textarea = this.container.querySelector('.rich-text-source');
    }

    createToolbar() {
        console.log('RichText: createToolbar');
        return `
            <div class="rich-text-toolbar border-bottom p-2 d-flex flex-wrap gap-1 align-items-center">
                ${this.createButton('code', 'bi-code-slash', 'Código fuente')}
                ${this.createDivider()}
                ${this.createFontSelector()}
                ${this.createFontSizeSelector()}
                ${this.createDivider()}
                ${this.createButton('bold', 'bi-type-bold', 'Negrita')}
                ${this.createButton('italic', 'bi-type-italic', 'Cursiva')}
                ${this.createButton('strikethrough', 'bi-type-strikethrough', 'Tachado')}
                ${this.createDivider()}
                ${this.createColorPicker('foreColor', 'bi-palette', 'Color de texto')}
                ${this.createButton('emoji', 'bi-emoji-smile', 'Insertar emoji')}
                ${this.createDivider()}
                ${this.createButton('link', 'bi-link-45deg', 'Insertar enlace')}
                ${this.createButton('image', 'bi-image', 'Insertar imagen')}
                ${this.createButton('youtube', 'bi-youtube', 'Insertar video de YouTube')}
                ${this.createDivider()}
                ${this.createButton('alignLeft', 'bi-text-left', 'Alinear izquierda')}
                ${this.createButton('alignCenter', 'bi-text-center', 'Alinear centro')}
                ${this.createButton('alignRight', 'bi-text-right', 'Alinear derecha')}
                ${this.createButton('alignJustify', 'bi-justify', 'Justificar')}
                ${this.createDivider()}
                ${this.createButton('insertUnorderedList', 'bi-list-ul', 'Lista desordenada')}
                ${this.createButton('insertOrderedList', 'bi-list-ol', 'Lista ordenada')}
                ${this.createDivider()}
                ${this.createButton('outdent', 'bi-text-indent-left', 'Reducir sangría')}
                ${this.createButton('indent', 'bi-text-indent-right', 'Aumentar sangría')}
                ${this.createDivider()}
                ${this.createButton('removeFormat', 'bi-eraser', 'Limpiar formato')}
                ${this.createDivider()}
                ${this.createButton('fullscreen', 'bi-arrows-fullscreen', 'Pantalla completa')}
            </div>
        `;
    }

    createButton(command, icon, title) {
        return `
            <button type="button" 
                    class="btn btn-sm btn-outline-secondary rich-text-btn" 
                    data-command="${command}"
                    title="${title}">
                <i class="bi ${icon} rich-text-btn-icon"></i>
            </button>
        `;
    }

    createDivider() {
        console.log('RichText: createDivider');
        return `<div class="vr"></div>`;
    }

    createFontSelector() {
        console.log('RichText: createFontSelector');
        const fonts = [
            'Arial', 'Courier New', 'Georgia', 'Times New Roman',
            'Trebuchet MS', 'Verdana'
        ];

        return `
            <select class="form-select form-select-sm rich-text-font-selector" 
                    style="width: auto;" 
                    title="Fuente">
                <option value="">Fuente</option>
                ${fonts.map(font => `<option value="${font}">${font}</option>`).join('')}
            </select>
        `;
    }

    createFontSizeSelector() {
        console.log('RichText: createFontSizeSelector');
        const sizes = [
            { value: '1', label: '10px' },
            { value: '2', label: '13px' },
            { value: '3', label: '16px' },
            { value: '4', label: '18px' },
            { value: '5', label: '24px' },
            { value: '6', label: '32px' },
            { value: '7', label: '48px' }
        ];

        return `
            <select class="form-select form-select-sm rich-text-size-selector" 
                    style="width: auto;" 
                    title="Tamaño">
                <option value="">Tamaño</option>
                ${sizes.map(size => `<option value="${size.value}">${size.label}</option>`).join('')}
            </select>
        `;
    }


    createColorPicker(command, icon, title) {
        console.log('RichText: createColorPicker', command);
        return `
            <div class="position-relative">
                <button type="button" 
                        class="btn btn-sm btn-outline-secondary rich-text-btn" 
                        title="${title}"
                        onclick="this.nextElementSibling.click()">
                    <i class="bi ${icon} rich-text-btn-icon"></i>
                </button>
                <input type="color" 
                       class="rich-text-color-picker" 
                       data-command="${command}"
                       style="position: absolute; opacity: 0; width: 0; height: 0;">
            </div>
        `;
    }

    createEditableArea() {
        console.log('RichText: createEditableArea');
        return `
            <div class="rich-text-content" 
                 contenteditable="true" 
                 style="min-height: ${this.options.height}; padding: 1rem; outline: none;"
                 data-placeholder="${this.options.placeholder}">
            </div>
            <textarea class="rich-text-source" 
                      style="display: none; width: 100%; min-height: ${this.options.height}; padding: 1rem; box-sizing: border-box;"
                      ></textarea>
        `;
    }

    attachEvents() {
        console.log('RichText: attachEvents');
        // Botones de la barra de herramientas
        this.toolbar.querySelectorAll('.rich-text-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                this.executeCommand(command);
            });
        });

        // Selector de fuente
        const fontSelector = this.toolbar.querySelector('.rich-text-font-selector');
        if (fontSelector) {
            fontSelector.addEventListener('change', (e) => {
                this.executeCommand('fontName', e.target.value);
                e.target.value = '';
            });
        }

        // Selector de tamaño de fuente
        const sizeSelector = this.toolbar.querySelector('.rich-text-size-selector');
        if (sizeSelector) {
            sizeSelector.addEventListener('change', (e) => {
                this.executeCommand('fontSize', e.target.value);
                e.target.value = '';
            });
        }

        // Selectores de color
        this.toolbar.querySelectorAll('.rich-text-color-picker').forEach(picker => {
            picker.addEventListener('change', (e) => {
                const command = e.target.dataset.command;
                this.executeCommand(command, e.target.value);
            });
        });

        // Click fuera del popover de emojis para cerrarlo
        document.addEventListener('click', (e) => {
            if (this.emojiPopover &&
                !e.target.closest('.emoji-popover') &&
                !e.target.closest('[data-command="emoji"]')) {
                this.closeEmojiPopover();
            }
        });

        // Prevenir pérdida de foco (excepto para selectores e inputs)
        this.toolbar.addEventListener('mousedown', (e) => {
            // No prevenir el comportamiento por defecto para elementos select e input
            if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
            }
        });

        // Forzar modo de salto de línea - usar <br> en lugar de <div>
        this.editor.addEventListener('keydown', (e) => {
            // Bloquear Enter cuando hay una imagen seleccionada para evitar <br> residuales
            if (this.selectedImage && e.key === 'Enter') {
                e.preventDefault();
                return;
            }

            if (e.key === 'Enter' && !e.shiftKey) {
                // Prevenir comportamiento por defecto (crear divs)
                e.preventDefault();
                // Insertar <br> y mover cursor
                document.execCommand('insertLineBreak');
            }
        });

        // Prevenir pegado con formato
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });

        // Establecer separador de párrafo por defecto a br
        try {
            document.execCommand('defaultParagraphSeparator', false, 'br');
        } catch (e) {
            // Algunos navegadores no soportan esto
        }
    }

    attachImageEvents() {
        console.log('RichText: attachImageEvents');
        // Click en el editor para manejar selección de imagen
        this.editor.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                this.selectImage(e.target);
            } else {
                this.deselectImage();
            }
        });

        // Click fuera del editor para deseleccionar
        document.addEventListener('click', (e) => {
            if (!this.editor.contains(e.target) && !e.target.closest('.rich-text-resize-handle')) {
                this.deselectImage();
            }
        });

        // Manejar inserción de imagen
        this.editor.addEventListener('DOMNodeInserted', (e) => {
            if (e.target.tagName === 'IMG') {
                this.setupImageResizing(e.target);
            }
        });
    }

    selectImage(img) {
        console.log('RichText: selectImage');
        // Evitar duplicados: si ya es la misma imagen, solo asegurar overlay correcto
        if (this.selectedImage !== img) {
            this.deselectImage();
            this.selectedImage = img;
        }

        this.updateResizeOverlay();
    }

    deselectImage() {
        console.log('RichText: deselectImage');
        if (this.selectedImage) {
            this.selectedImage = null;
        }

        this.removeResizeOverlay();
    }

    startResize(e, img, position) {
        console.log('RichText: startResize', position);
        e.preventDefault();

        const rect = img.getBoundingClientRect();
        const aspectRatio = rect.width / rect.height;

        this.resizeData = {
            img,
            position,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: rect.width,
            startHeight: rect.height,
            aspectRatio,
            onMouseMove: null,
            onMouseUp: null
        };

        const onMouseMove = (evt) => this.handleResize(evt);
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.resizeData = null;
        };

        this.resizeData.onMouseMove = onMouseMove;
        this.resizeData.onMouseUp = onMouseUp;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    handleResize(e) {
        // throttle or bail early could be added here
        console.log('RichText: handleResize');
        if (!this.resizeData) return;

        const { img, position, startX, startY, startWidth, startHeight, aspectRatio } = this.resizeData;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        // Controladores de esquina - mantener relación de aspecto
        if (position.includes('e') || position.includes('w')) {
            if (position.includes('e')) {
                newWidth = startWidth + deltaX;
            } else {
                newWidth = startWidth - deltaX;
            }
        }

        if (position.includes('n') || position.includes('s')) {
            if (position.includes('s')) {
                newHeight = startHeight + deltaY;
            } else {
                newHeight = startHeight - deltaY;
            }
        }

        // Redimensionar esquina - mantener relación de aspecto
        if (position.length === 2) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                newHeight = newWidth / aspectRatio;
            } else {
                newWidth = newHeight * aspectRatio;
            }
        }

        // Aplicar tamaño mínimo
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        img.style.width = newWidth + 'px';
        img.style.height = newHeight + 'px';

        // Mantener overlay alineado con el nuevo tamaño
        this.updateResizeOverlay();
    }

    setupImageResizing(img) {
        console.log('RichText: setupImageResizing');
        // Ya no forzamos cursor pointer ni clases adicionales aquí;
        // la selección/overlay se maneja sólo por clic y estilos globales.
    }

    // Crea (si no existe) y posiciona el overlay absoluto sobre la imagen seleccionada
    updateResizeOverlay() {
        if (!this.selectedImage) return;

        const img = this.selectedImage;

        if (!this.imageResizeOverlay) {
            const overlay = document.createElement('div');
            overlay.className = 'rich-text-resize-overlay';

            const positions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
            positions.forEach(pos => {
                const handle = document.createElement('div');
                handle.className = `rich-text-resize-handle handle-${pos}`;
                handle.dataset.position = pos;
                handle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.startResize(e, img, pos);
                });
                overlay.appendChild(handle);
            });

            // Reposicionar overlay en scroll y resize de ventana
            const reposition = () => this.positionOverlay();
            window.addEventListener('resize', reposition);
            // Mantener overlay alineado con el scroll global
            window.addEventListener('scroll', reposition, true);

            overlay._repositionHandler = reposition; // guardar para limpiar

            document.body.appendChild(overlay);
            this.imageResizeOverlay = overlay;
        }

        this.positionOverlay();
    }

    positionOverlay() {
        if (!this.imageResizeOverlay || !this.selectedImage) return;

        const imgRect = this.selectedImage.getBoundingClientRect();

        Object.assign(this.imageResizeOverlay.style, {
            display: 'block',
            position: 'absolute',
            left: imgRect.left + window.scrollX + 'px',
            top: imgRect.top + window.scrollY + 'px',
            width: imgRect.width + 'px',
            height: imgRect.height + 'px'
        });
    }

    removeResizeOverlay() {
        if (!this.imageResizeOverlay) return;

        const overlay = this.imageResizeOverlay;

        // Quitar listeners de scroll/resize registrados en updateResizeOverlay
        if (overlay._repositionHandler) {
            window.removeEventListener('resize', overlay._repositionHandler);
            if (this.editor) {
                this.editor.removeEventListener('scroll', overlay._repositionHandler);
            }
        }

        overlay.remove();
        this.imageResizeOverlay = null;
    }

    insertLink() {
        console.log('RichText: insertLink');
        const url = prompt('Introduce la URL del enlace:');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    }

    insertImage() {
        console.log('RichText: insertImage');
        const url = prompt('Introduce la URL de la imagen:');
        if (url) {
            // Validar imagen antes de insertar
            const img = new Image();

            img.onload = () => {
                document.execCommand('insertImage', false, url);

                // Esperar a que la imagen sea insertada y configurar redimensionamiento
                setTimeout(() => {
                    const images = this.editor.querySelectorAll('img');
                    const lastImage = images[images.length - 1];
                    if (lastImage) {
                        this.setupImageResizing(lastImage);
                    }
                }, 100);
            };

            img.onerror = () => {
                alert('Error: No se pudo cargar la imagen. Verifica la URL.');
            };

            img.src = url;
        }
    }

    insertYouTube() {
        console.log('RichText: insertYouTube');
        const url = prompt('Introduce la URL del video de YouTube:');
        if (url) {
            // Extraer el ID del video de YouTube de diferentes formatos de URL
            let videoId = null;

            // Formato: https://www.youtube.com/watch?v=VIDEO_ID
            const watchMatch = url.match(/[?&]v=([^&]+)/);
            if (watchMatch) {
                videoId = watchMatch[1];
            }

            // Formato: https://youtu.be/VIDEO_ID
            const shortMatch = url.match(/youtu\.be\/([^?]+)/);
            if (shortMatch) {
                videoId = shortMatch[1];
            }

            // Formato: https://www.youtube.com/embed/VIDEO_ID
            const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
            if (embedMatch) {
                videoId = embedMatch[1];
            }

            if (videoId) {
                // Crear el contenedor con el iframe embebido
                const videoHTML = `
                    <div class="video-container">
                        <iframe
                            src="https://www.youtube.com/embed/${videoId}"
                            title="YouTube video"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen>
                        </iframe>
                    </div>
                `;

                // Insertar el HTML en el editor
                document.execCommand('insertHTML', false, videoHTML);
            } else {
                alert('Error: URL de YouTube no válida. Por favor, usa un formato como:\n- https://www.youtube.com/watch?v=VIDEO_ID\n- https://youtu.be/VIDEO_ID');
            }
        }
    }

    getEmojiList() {
        if (this.options.emojiSet === 'custom') {
            // Si ya tenemos los emojis cargados en cache, retornarlos
            if (this.customEmojis) {
                return this.customEmojis;
            }

            // Si no hay lista personalizada configurada, retornar array vacío
            if (!this.options.customEmojiList) {
                console.warn('RichText: customEmojiList no está configurado. Usa la opción customEmojiList para especificar la ruta del archivo JSON.');
                return [];
            }

            // Retornar array vacío temporalmente, los emojis se cargarán de forma asíncrona
            return [];
        } else {
            // Emojis Unicode por defecto
            return [
                '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
                '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
                '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏',
                '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
                '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
                '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰',
                '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
                '😡', '😠', '🤬', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈',
                '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐',
                '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
                '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '❤️', '🧡',
                '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓',
                '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯',
                '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏',
                '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶',
                '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵',
                '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨',
                '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️', '▫️',
                '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '⭐', '🌟',
                '✨', '⚡', '💥', '🔥', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️'
            ];
        }
    }

    async loadCustomEmojis() {
        if (!this.options.customEmojiList) {
            return [];
        }

        try {
            const response = await fetch(this.options.customEmojiList);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const emojis = await response.json();
            this.customEmojis = emojis;
            return emojis;
        } catch (error) {
            console.error('RichText: Error al cargar emojis personalizados:', error);
            return [];
        }
    }

    async toggleEmojiPopover() {
        console.log('RichText: toggleEmojiPopover');

        if (this.emojiPopover) {
            this.closeEmojiPopover();
            return;
        }

        // Cargar emojis personalizados si es necesario
        let emojis;
        if (this.options.emojiSet === 'custom' && !this.customEmojis) {
            emojis = await this.loadCustomEmojis();
        } else {
            emojis = this.getEmojiList();
        }

        // Si no hay emojis, no mostrar el popover
        if (!emojis || emojis.length === 0) {
            alert('No se pudieron cargar los emojis. Verifica la configuración.');
            return;
        }

        const emojiBtn = this.toolbar.querySelector('[data-command="emoji"]');
        const rect = emojiBtn.getBoundingClientRect();

        // Crear popover
        const popover = document.createElement('div');
        popover.className = 'emoji-popover';

        // Crear tabla de emojis (4 columnas)
        let emojiTable = '<div class="emoji-grid">';

        if (this.options.emojiSet === 'custom') {
            // Emojis personalizados como imágenes
            emojis.forEach((emoji) => {
                emojiTable += `<button type="button" class="emoji-btn" data-emoji="${emoji.code}">
                    <img src="${this.options.customEmojiPath}${emoji.file}" alt="${emoji.code}" class="custom-emoji-icon">
                </button>`;
            });
        } else {
            // Emojis Unicode por defecto
            emojis.forEach((emoji) => {
                emojiTable += `<button type="button" class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`;
            });
        }
        emojiTable += '</div>';

        popover.innerHTML = emojiTable;

        // Posicionar debajo del botón
        popover.style.position = 'absolute';
        popover.style.left = rect.left + window.scrollX + 'px';
        popover.style.top = rect.bottom + window.scrollY + 'px';

        document.body.appendChild(popover);
        this.emojiPopover = popover;

        // Eventos de clic en emojis
        popover.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const emoji = btn.dataset.emoji;
                this.insertEmoji(emoji);
            });
        });
    }

    closeEmojiPopover() {
        if (this.emojiPopover) {
            this.emojiPopover.remove();
            this.emojiPopover = null;
        }
    }

    insertEmoji(emoji) {
        console.log('RichText: insertEmoji', emoji);

        if (this.options.emojiSet === 'custom') {
            // Insertar emoji personalizado como imagen
            const emojiList = this.getEmojiList();
            const emojiData = emojiList.find(e => e.code === emoji);

            if (emojiData) {
                const imgHTML = `<img src="${this.options.customEmojiPath}${emojiData.file}" alt="${emoji}" class="custom-emoji-inline" title="${emoji}">`;
                document.execCommand('insertHTML', false, imgHTML);
            }
        } else {
            // Insertar emoji Unicode
            document.execCommand('insertText', false, emoji);
        }

        this.closeEmojiPopover();
        this.editor.focus();
    }

    toggleFullscreen() {
        console.log('RichText: toggleFullscreen');
        const editorWrapper = this.container.querySelector('.rich-text-editor');

        if (editorWrapper.classList.contains('fullscreen')) {
            editorWrapper.classList.remove('fullscreen');
            this.editor.style.minHeight = this.options.height;
        } else {
            editorWrapper.classList.add('fullscreen');
            this.editor.style.minHeight = 'calc(100vh - 60px)';
        }
    }

    executeCommand(command, value = null) {
        console.log('RichText: executeCommand', command, value);
        if (command !== 'code' && command !== 'fullscreen' && this.isSourceMode) {
            this.switchToVisualMode();
        }

        const commands = {
            code: () => this.toggleSourceCode(),
            bold: () => document.execCommand('bold', false, null),
            italic: () => document.execCommand('italic', false, null),
            strikethrough: () => document.execCommand('strikeThrough', false, null),
            link: () => this.insertLink(),
            image: () => this.insertImage(),
            youtube: () => this.insertYouTube(),
            emoji: () => this.toggleEmojiPopover(),
            alignLeft: () => document.execCommand('justifyLeft', false, null),
            alignCenter: () => document.execCommand('justifyCenter', false, null),
            alignRight: () => document.execCommand('justifyRight', false, null),
            alignJustify: () => document.execCommand('justifyFull', false, null),
            insertUnorderedList: () => document.execCommand('insertUnorderedList', false, null),
            insertOrderedList: () => document.execCommand('insertOrderedList', false, null),
            outdent: () => document.execCommand('outdent', false, null),
            indent: () => document.execCommand('indent', false, null),
            removeFormat: () => document.execCommand('removeFormat', false, null),
            fullscreen: () => this.toggleFullscreen(),
            fontName: () => document.execCommand('fontName', false, value),
            fontSize: () => document.execCommand('fontSize', false, value),
            foreColor: () => document.execCommand('foreColor', false, value)
        };

        if (commands[command]) {
            commands[command]();
            // focus the visible editor
            if (this.isSourceMode && this.textarea) {
                this.textarea.focus();
            } else if (this.editor) {
                this.editor.focus();
            }
        }
    }

    toggleSourceCode() {
        console.log('RichText: toggleSourceCode');
        if (this.isSourceMode) {
            this.switchToVisualMode();
        } else {
            this.switchToSourceMode();
        }
    }

    switchToSourceMode() {
        console.log('RichText: switchToSourceMode');
        if (this.textarea) {
            this.textarea.value = this.editor.innerHTML;
            this.editor.style.display = 'none';
            this.textarea.style.display = 'block';
            this.isSourceMode = true;
            this.disableToolbarButtons();
            this.textarea.focus();
        }
    }

    switchToVisualMode() {
        console.log('RichText: switchToVisualMode');
        if (this.textarea) {
            this.editor.innerHTML = this.textarea.value;
            this.textarea.style.display = 'none';
            this.editor.style.display = 'block';
            this.isSourceMode = false;
            this.enableToolbarButtons();
            this.editor.focus();
        }
    }

    disableToolbarButtons() {
        console.log('RichText: disableToolbarButtons');
        // Deshabilitar todos los botones excepto 'code' y 'fullscreen'
        this.toolbar.querySelectorAll('.rich-text-btn').forEach(btn => {
            const command = btn.dataset.command;
            if (command !== 'code' && command !== 'fullscreen') {
                btn.disabled = true;
                btn.classList.add('disabled');
            }
        });

        // Deshabilitar selectores
        const fontSelector = this.toolbar.querySelector('.rich-text-font-selector');
        const sizeSelector = this.toolbar.querySelector('.rich-text-size-selector');
        if (fontSelector) fontSelector.disabled = true;
        if (sizeSelector) sizeSelector.disabled = true;

        // Deshabilitar color pickers
        this.toolbar.querySelectorAll('.rich-text-color-picker').forEach(picker => {
            picker.disabled = true;
        });
    }

    enableToolbarButtons() {
        console.log('RichText: enableToolbarButtons');
        // Habilitar todos los botones
        this.toolbar.querySelectorAll('.rich-text-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });

        // Habilitar selectores
        const fontSelector = this.toolbar.querySelector('.rich-text-font-selector');
        const sizeSelector = this.toolbar.querySelector('.rich-text-size-selector');
        if (fontSelector) fontSelector.disabled = false;
        if (sizeSelector) sizeSelector.disabled = false;

        // Habilitar color pickers
        this.toolbar.querySelectorAll('.rich-text-color-picker').forEach(picker => {
            picker.disabled = false;
        });
    }


    getContent() {
        console.log('RichText: getContent');
        // Si está en modo código fuente, retornar el contenido del textarea
        if (this.isSourceMode && this.textarea) {
            return this.textarea.value;
        }
        // Si está en modo visual, retornar el HTML del editor
        if (this.editor) {
            return this.editor.innerHTML;
        }
        return '';
    }

    setContent(content) {
        console.log('RichText: setContent');
        if (this.isSourceMode && this.textarea) {
            this.textarea.value = content;
        } else if (this.editor) {
            this.editor.innerHTML = content;
        }
    }
}

