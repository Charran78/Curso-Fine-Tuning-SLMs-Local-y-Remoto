# Fine-Tuning SLMs Local y Remoto

Curso interactivo en español para aprender a especializar modelos pequeños y ejecutarlos localmente con Ollama.

- **Curso en línea:** [charran78.github.io/Curso-Fine-Tuning-SLMs-Local-y-Remoto](https://charran78.github.io/Curso-Fine-Tuning-SLMs-Local-y-Remoto/)
- **Repositorio:** [github.com/Charran78/Curso-Fine-Tuning-SLMs-Local-y-Remoto](https://github.com/Charran78/Curso-Fine-Tuning-SLMs-Local-y-Remoto)

La versión pública se sirve con GitHub Pages desde la rama `gh-pages`.

## Sobre el curso

El curso recorre Ollama y los `Modelfile`, preparación de datasets, fine-tuning con QLoRA, exportación a GGUF, publicación de modelos y proyectos prácticos. La web está construida con HTML, CSS y JavaScript vanilla usando ES Modules nativos: no necesita frameworks, dependencias, instalación ni proceso de build.

## Cómo seguirlo

1. Completa en orden los **capítulos 1–13**; son obligatorios para el progreso.
2. Al completarlos, se desbloquea el **examen del capítulo 14**.
3. Los **apéndices 15–16** son material de consulta y no condicionan el progreso ni el examen.
4. El reconocimiento de finalización requiere completar los capítulos obligatorios y responder correctamente las preguntas del examen.

El reconocimiento es únicamente una constancia de finalización del curso: **no es una acreditación oficial ni profesional**.

## Probarlo en local

No hace falta instalar paquetes ni compilar nada. Para servir los módulos JavaScript correctamente, inicia un servidor HTTP desde la carpeta del proyecto, donde está `index.html`.

En Windows, abre PowerShell en esa carpeta y ejecuta:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

En macOS o Linux:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abre [http://127.0.0.1:8000/](http://127.0.0.1:8000/) en el navegador. Para detener el servidor, vuelve a la terminal y pulsa `Ctrl+C`. Si `py` o `python3` no está disponible, usa el comando equivalente de Python instalado en tu sistema.

## Progreso y privacidad

El progreso se guarda en el almacenamiento local del navegador, asociado al navegador y al origen desde el que se abrió el curso. No se sincroniza automáticamente entre dispositivos, navegadores, `file://` y sitios web.

Para mover el progreso entre copias u orígenes, exporta el estado a un archivo JSON desde el origen y luego selecciónalo en **Transferir progreso local** en el destino. La importación muestra una vista previa y, al confirmarla, **reemplaza** el progreso, las respuestas del examen y la configuración de `Modelfile` guardados en ese origen. El tema visual no se transfiere. El JSON puede contener el *system prompt* de tu `Modelfile`; conserva el archivo de forma privada.

## Vídeos

Los vídeos de YouTube se cargan de forma diferida al abrir cada sección de vídeo. YouTube puede mostrar el error **153** si la solicitud no incluye un encabezado HTTP `Referer`; abrir la página directamente desde `file://` no lo envía. Si ocurre, accede al curso desde su [URL HTTPS publicada](https://charran78.github.io/Curso-Fine-Tuning-SLMs-Local-y-Remoto/).

## Recursos relacionados

- **Libro electrónico:** [Tuning con Ollama — Local AI Engineering](https://buymeacoffee.com/beyonddigiv/e/513275).
- **Herramienta complementaria con NiceGUI:** [Automated-SLM-Fine-Tuning-Tool · rama `feature/remote-training`](https://github.com/Charran78/Automated-SLM-Fine-Tuning-Tool/tree/feature/remote-training). Es un proyecto aparte del sitio del curso. El uso de Kaggle es opcional y requiere optar por el flujo privado; la gestión y retención de los datasets corresponde al usuario. No se garantiza su eliminación automática, así que revisa y gestiona los datos en el servicio utilizado.
