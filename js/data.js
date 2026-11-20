export const MODELFILE_PRESETS = {
      fiscal: 'Eres un asesor fiscal especializado en autónomos y pequeños negocios en España. Conoces el régimen de estimación directa, las deducciones de IVA, el IRPF y los modelos 130, 303 y 390. Respondes en español con tono profesional y cercano; si algo requiere un gestor, lo adviertes.',
      codigo: 'Eres un arquitecto de software senior con 20 años de experiencia en Python y sistemas backend. Respondes en español, de forma directa, incluyendo ejemplos prácticos y tests unitarios.',
      odoo: 'Eres un consultor experto en Odoo ERP (contabilidad, inventario, ventas y CRM). Respondes únicamente basándote en la documentación oficial de Odoo y buenas prácticas; si desconoces un dato, lo indicas.'
    };

export const REQUIRED_CHAPTER_IDS = Array.from({ length: 13 }, (_, index) => 'cap-' + (index + 1));

export const STRATEGY_DATA = {
      tone: {
        title: 'Recomendación: Modelfile (SYSTEM + PARAMETER)',
        desc: 'Si el modelo ya domina el conocimiento base y solo necesitas ajustar tono, idioma o reglas de respuesta, un SYSTEM prompt bien redactado con temperature 0.2–0.4 resuelve el problema en segundos.'
      },
      docs: {
        title: 'Recomendación: Fine-Tuning QLoRA (Capítulos 5–7)',
        desc: 'La documentación interna o versiones recientes de software no existían en el preentrenamiento. Necesitas ajustar los pesos con un dataset curado en JSONL para reducir alucinaciones.'
      },
      json: {
        title: 'Recomendación: Fine-Tuning (o MESSAGE si son muy pocos campos)',
        desc: 'Cuando el modelo debe generar estructuras JSON complejas y estrictas de forma consistente en producción, el fine-tuning con cientos de pares válidos garantiza obediencia estructural sin gastar contexto en ejemplos.'
      },
      fewshot: {
        title: 'Recomendación: Modelfile con directivas MESSAGE',
        desc: 'Añadir 2 o 3 pares MESSAGE user / MESSAGE assistant enseña el formato esperado al inicio del diálogo sin necesidad de preparar GPU ni dataset.'
      },
      nogpu: {
        title: 'Recomendación: Modelfile + Ingeniería de Prompts (o ruta CPU en SLM Automator)',
        desc: 'Para iteración inmediata sin GPU ni presupuesto en la nube, comienza con un Modelfile. Si necesitas entrenar pesos sin GPU, recuerda que la ruta fallback CPU (FP32) tardará entre 1 y 3 horas.'
      }
    };

export const DATASET_RAW_TEMPLATES = {
      fiscal: [
        ['¿Qué es el modelo 130?', 'Es la declaración trimestral del pago fraccionado del IRPF para autónomos en estimación directa. Se presenta en abril, julio, octubre y enero.'],
        ['¿Cuándo se presenta el modelo 303?', 'El modelo 303 de autoliquidación trimestral del IVA se presenta los primeros 20 días naturales de abril, julio, octubre y enero (el 4T hasta el 30 de enero).'],
        ['¿Para qué sirve el modelo 390?', 'Es el resumen anual informativo del IVA correspondiente al ejercicio anterior; se presenta en enero junto con el último trimestre.'],
        ['¿Puedo deducir el IVA de un ordenador?', 'Sí, al 100% si es de uso exclusivo para la actividad económica; si tiene uso mixto profesional y personal, solo en la proporción justificada.'],
        ['¿Cómo se deduce la gasolina siendo autónomo?', 'Requiere afectación del vehículo a la actividad. En uso mixto suele admitirse hasta el 50% del IVA si se acredita mediante registro de kilometraje profesional.'],
        ['¿Qué gastos son deducibles en estimación directa?', 'Compras de mercancías, alquiler del local, suministros, telefonía profesional, material de oficina, seguros, cuotas del RETA y amortizaciones.'],
        ['¿Qué porcentaje de suministros puedo deducir si teletrabajo desde casa?', 'Puedes deducir el 30% de la parte proporcional de los metros cuadrados de la vivienda afectos a la actividad, previa comunicación en el modelo 036/037.'],
        ['¿Qué es el modelo 036 y el 037?', 'Son las declaraciones censales de alta, modificación o baja en el censo de empresarios y profesionales; el 037 es la versión simplificada.'],
        ['¿Qué retención de IRPF aplica un nuevo autónomo profesional?', 'Durante el año de inicio de actividad y los dos siguientes puede aplicar el tipo reducido del 7% en sus facturas; el tipo general es del 15%.'],
        ['¿Qué es el modelo 111?', 'Es la autoliquidación trimestral de retenciones e ingresos a cuenta practicados a trabajadores y a profesionales en sus facturas.'],
        ['¿Cuándo se presenta el modelo 115?', 'Cada trimestre, cuando pagas alquiler de un local u oficina sujeto a retención de IRPF, ingresando la retención practicada al arrendador.'],
        ['¿Qué es el modelo 347?', 'Declaración anual informativa de operaciones con terceras personas cuando el conjunto de compras o ventas con un mismo cliente o proveedor supera los 3.005,06 euros.'],
        ['¿Qué es el ROI y el modelo 349?', 'El Registro de Operadores Intracomunitarios habilita para facturar servicios o bienes B2B dentro de la UE sin IVA; dichas operaciones se declaran en el modelo 349.'],
        ['¿Son deducibles las multas y sanciones de Hacienda?', 'No. Las multas, sanciones penales o administrativas y los recargos de apremio nunca son gastos fiscalmente deducibles.'],
        ['¿Qué diferencia hay entre estimación directa normal y simplificada?', 'La simplificada aplica a actividades cuya cifra de negocios no supera los 600.000 euros anuales e incluye un porcentaje automático de gastos de difícil justificación.'],
        ['¿Cómo se calcula la cuota de autónomos por ingresos reales?', 'Se suman los rendimientos netos anuales más las cuotas del RETA, se deduce un 7% por gastos genéricos y se ubica la base resultante en la tabla de tramos.'],
        ['¿Qué es una factura rectificativa?', 'Documento que corrige errores de importe, base imponible, tipo de IVA o datos fiscales de una factura ya emitida, usando una serie numérica específica.'],
        ['¿Cuánto tiempo debo conservar las facturas?', 'La normativa tributaria exige conservar facturas emitidas, recibidas y justificantes durante al menos 4 años desde la presentación del impuesto; el Código de Comercio amplía a 6 años.'],
        ['¿Puedo deducir dietas de manutención?', 'Sí, siempre que se produzcan en establecimientos de restauración, se paguen por medios electrónicos, tengan relación con la actividad y no superen los límites diarios legales.'],
        ['¿Qué es el recargo de equivalencia?', 'Régimen especial de IVA obligatorio para comerciantes minoristas autónomos; los proveedores repercuten un recargo adicional y el comerciante no presenta modelo 303.'],
        ['¿Qué implica darse de alta en el IAE?', 'Las personas físicas están exentas del pago del Impuesto de Actividades Económicas, pero deben elegir el epígrafe correcto en el alta censal.'],
        ['¿Cómo funciona la amortización de un equipo informático?', 'Los bienes de inversión de mayor cuantía se deducen gradualmente según su vida útil mediante tablas oficiales, o de forma acelerada si son bienes de escaso valor.'],
        ['¿Qué ocurre si presento un impuesto fuera de plazo sin requerimiento?', 'Se aplica el recargo por declaración extemporánea sin requerimiento previo (1% más 1% adicional por cada mes completo de retraso).'],
        ['¿Qué datos mínimos lleva una factura completa?', 'Número y serie, fecha de expedición, NIF y razón social de emisor y receptor, descripción de la operación, base imponible, tipo de IVA/IRPF y total.'],
        ['¿Cómo tributan los bienes adquiridos de segunda mano a un particular?', 'No llevan IVA sino Impuesto sobre Transmisiones Patrimoniales (ITP), y el contrato de compraventa debe justificar el gasto contable.']
      ],
      odoo: [
        ['¿Cómo activo el modo desarrollador en Odoo?', 'Ve a Ajustes y pulsa "Activar el modo desarrollador" en la parte inferior derecha, o añade ?debug=1 justo después de /web en la URL.'],
        ['¿Qué diferencia hay entre una orden de venta y una factura en Odoo?', 'La orden de venta confirma el acuerdo comercial con el cliente; la factura es el documento fiscal que formaliza el cobro desde la orden mediante "Crear factura".'],
        ['¿Cómo se configuran ubicaciones de almacén en Odoo Inventario?', 'Activa el modo desarrollador o las ubicaciones de almacenamiento en Inventario > Configuración > Ajustes y crea la jerarquía en Configuración > Ubicaciones.'],
        ['¿Cómo se crea un informe PDF personalizado en Odoo?', 'Mediante plantillas QWeb en XML combinadas con un registro ir.actions.report y métodos en el modelo Python declarados en el archivo __manifest__.py.'],
        ['¿Qué función cumple el archivo __manifest__.py?', 'Es el descriptor del módulo Odoo: define nombre, versión, dependencias (depends), archivos XML de vistas/seguridad (data) y si es instalable.'],
        ['¿Cómo se controla el acceso por roles a un modelo nuevo en Odoo?', 'A través del archivo security/ir.model.access.csv asignando permisos de lectura, escritura, creación y borrado (perm_read, write, create, unlink) a cada grupo.'],
        ['¿Qué hace el atributo _inherit en un modelo de Odoo?', 'Permite extender un modelo existente (como sale.order o res.partner) para añadir nuevos campos o sobrescribir métodos sin modificar el código núcleo.'],
        ['¿Para qué sirve el método search() en el ORM de Odoo?', 'Recibe un dominio de tuplas [(campo, operador, valor)] y devuelve un recordset con todos los registros que cumplen las condiciones.'],
        ['¿Cuál es la diferencia entre browse() y search()?', 'search() consulta la base de datos según criterios lógicos, mientras browse(ids) instancia directamente el recordset a partir de IDs conocidos.'],
        ['¿Cómo se habilita la trazabilidad por lotes o números de serie?', 'En Inventario > Configuración > Ajustes marca "Lotes y números de serie" y define en la ficha de cada producto el tipo de seguimiento requerido.'],
        ['¿Qué es una regla de reabastecimiento en Odoo?', 'Regla que define stock mínimo y máximo para un producto en una ubicación; cuando baja del mínimo, Odoo genera automáticamente una solicitud de presupuesto u orden de fabricación.'],
        ['¿Cómo se realiza una factura rectificativa en Odoo Contabilidad?', 'Abre la factura publicada, pulsa "Añadir nota de crédito", indica el motivo y el método (reembolso parcial, completo o modificación) y confirma el borrador.'],
        ['¿Qué es la conciliación bancaria en Odoo?', 'El emparejamiento entre las líneas del extracto bancario importado y los apuntes de facturas o pagos registrados en los diarios contables.'],
        ['¿Para qué sirven los diarios contables en Odoo?', 'Agrupan asientos según su naturaleza: Ventas, Compras, Banco, Caja y Operaciones Varias, manteniendo secuencias numéricas separadas.'],
        ['¿Cómo funciona la lista de materiales (BoM) en Odoo Fabricación?', 'Define los componentes, cantidades y operaciones de ruta necesarios para ensamblar un producto terminado en una orden de fabricación.'],
        ['¿Qué es la contabilidad analítica en Odoo?', 'Sistema paralelo al plan contable legal que imputa ingresos y gastos por proyecto, departamento o centro de costes para medir rentabilidad.'],
        ['¿Cómo exporto conversaciones reales de Odoo para fine-tuning?', 'Mediante módulos comunitarios como llm_training o odoo18-gpt-integration, que permiten curar y exportar logs de preguntas y respuestas a formato JSONL.'],
        ['¿Qué temperatura conviene usar al desplegar un modelo experto en Odoo?', 'Conviene usar temperatura baja (0.2 a 0.3) tanto en evaluación como en el Modelfile para garantizar respuestas técnicas fieles y sin divagaciones.'],
        ['¿Cómo evito que una vista heredada rompa al actualizar Odoo?', 'Usa expresiones xpath estables apuntando a atributos name claros en lugar de posiciones numéricas frágiles dentro de la arquitectura XML.'],
        ['¿Qué decorador se usa en Odoo para campos calculados?', 'Se utiliza @api.depends("campo_origen") sobre el método Python que asigna el valor al campo con compute="_nombre_metodo".'],
        ['¿Qué hace el decorador @api.onchange en Odoo?', 'Ejecuta lógica reactiva en la interfaz del formulario antes de guardar en base de datos cuando el usuario modifica un campo específico.'],
        ['¿Cómo se configura un almacén con recepción en dos pasos?', 'En Inventario > Configuración > Almacenes selecciona en "Envíos entrantes" la opción de recibir en zona de entrada y luego almacenar en stock.'],
        ['¿Qué es un diario de valoración de inventario automatizado?', 'Configuración por categoría de producto que genera asientos contables de variación de existencias automáticamente en cada entrada o salida de almacén.'],
        ['¿Para qué sirve el módulo CRM de Odoo?', 'Gestiona el embudo de oportunidades mediante etapas Kanban, asignación de comerciales, probabilidad de cierre y conversión directa a presupuestos.'],
        ['¿Cómo se ejecuta Odoo en modo actualización de un módulo desde terminal?', 'Lanzando el binario con los flags -d nombre_bd -u nombre_modulo --stop-after-init para aplicar cambios de Python y XML al instante.']
      ],
      python: [
        ['¿Cómo uno dos DataFrames de pandas por una columna clave?', 'Usa pd.merge(df1, df2, on="clave", how="inner") para intersección, o how="left" si deseas conservar todas las filas del primer DataFrame.'],
        ['¿Cómo leo un archivo JSONL línea por línea en Python?', 'Abre el archivo con open("datos.jsonl", "r", encoding="utf-8") y aplica json.loads(linea) en cada iteración de un bucle for.'],
        ['¿Cómo extraigo todas las direcciones de email de un texto con regex?', 'Con re.findall(r"[\\\\w.+-]+@[\\\\w-]+\\\\.[\\\\w.-]+", texto) obtendrás una lista con todas las coincidencias encontradas.'],
        ['¿Cuál es la ventaja de una list comprehension frente a un bucle for?', 'Es más concisa y suele ejecutarse más rápido en CPython para transformar o filtrar colecciones: [x * 2 for x in nums if x > 0].'],
        ['¿Cómo agrupo y sumo valores en pandas?', 'Aplica df.groupby("categoria")["importe"].sum().reset_index() para obtener el total agregado por cada grupo.'],
        ['¿Cómo manejo valores nulos en un DataFrame de pandas?', 'Usa df.isna().sum() para detectarlos, df.dropna() para descartarlos o df.fillna(0) para imputar un valor por defecto.'],
        ['¿Para qué sirve la sentencia with al abrir archivos?', 'Implementa un gestor de contexto que garantiza el cierre automático del descriptor del archivo incluso si ocurre una excepción durante la lectura.'],
        ['¿Cómo vectorizo una condición sobre un array de NumPy?', 'Con np.where(arr > 10, "alto", "bajo") evalúas toda la matriz en código compilado sin escribir bucles en Python.'],
        ['¿Qué diferencia hay entre yield y return en una función?', 'return finaliza la función devolviendo todo el resultado; yield la convierte en un generador que produce valores bajo demanda ahorrando memoria.'],
        ['¿Cómo cuento frecuencias de elementos en una lista?', 'Importa Counter desde collections y ejecuta Counter(lista), que devuelve un diccionario ordenado con el conteo de cada elemento.'],
        ['¿Cómo escribo un test unitario sencillo con pytest?', 'Define una función cuyo nombre empiece por test_ y utiliza sentencias assert sobre el valor devuelto frente al resultado esperado.'],
        ['¿Qué hace pathlib.Path frente a os.path?', 'Ofrece una API orientada a objetos multiplataforma para manipular rutas: Path("salida") / "modelo.gguf" funciona en Windows y Linux.'],
        ['¿Cómo realizo una petición HTTP POST con JSON usando requests?', 'Llama a requests.post(url, json=diccionario, timeout=30) y verifica response.raise_for_status() antes de leer response.json().'],
        ['¿Cómo ordeno una lista de diccionarios por una clave concreta?', 'Usa sorted(datos, key=lambda d: d["puntuacion"], reverse=True) para ordenar de mayor a menor sin mutar la lista original.'],
        ['¿Qué es un dataclass en Python?', 'Un decorador (@dataclass) de la librería estándar que genera automáticamente __init__, __repr__ y __eq__ a partir de anotaciones de tipo.'],
        ['¿Cómo elimino espacios sobrantes y normalizo texto?', 'Combina " ".join(texto.split()) para colapsar múltiples espacios, tabulaciones y saltos de línea en un solo espacio limpio.'],
        ['¿Cómo evito KeyError al consultar un diccionario?', 'Utiliza diccionario.get("clave", valor_defecto) o collections.defaultdict si vas a acumular elementos en listas o contadores.'],
        ['¿Qué hace enumerate() en un bucle for?', 'Devuelve pares (indice, elemento) en cada iteración, evitando mantener contadores manuales con i += 1.'],
        ['¿Cómo guardo una lista de conversaciones en formato JSONL?', 'Itera sobre la lista y escribe json.dumps(item, ensure_ascii=False) + "\\n" para mantener caracteres Unicode legibles.'],
        ['¿Cómo capturo una excepción sin ocultar el error original?', 'Registra el contexto específico en un bloque try/except Exception as exc: y relanza con raise RuntimeError(f"Fallo en {archivo}: {exc}") from exc.'],
        ['¿Qué es un entorno virtual venv y por qué usarlo?', 'Aísla el intérprete Python y las versiones exactas de librerías de cada proyecto (python -m venv venv), evitando conflictos globales.'],
        ['¿Cómo mido el tiempo de ejecución de un bloque en Python?', 'Calcula la diferencia entre time.perf_counter() antes y después de la operación para obtener precisión submilisegundo.'],
        ['¿Cómo deserializo JSON extraído dentro de etiquetas XML <tool_call>?', 'Extrae el contenido con re.search(r"<tool_call>(.*?)</tool_call>", resp, re.DOTALL) y pásalo a json.loads(match.group(1)).'],
        ['¿Cómo compruebo sintaxis de scripts Python sin ejecutarlos?', 'Ejecutando python -m py_compile archivo.py desde la consola se validan errores de sintaxis antes de desplegar.'],
        ['¿Qué diferencia hay entre *args y **kwargs?', '*args recoge argumentos posicionales variables en una tupla; **kwargs captura argumentos nominales variables en un diccionario.']
      ],
      ollama: [
        ['¿Qué comando descarga un modelo en Ollama sin iniciar chat?', 'Ejecuta ollama pull <modelo>, por ejemplo ollama pull gemma3:4b, para descargarlo al almacén local.'],
        ['¿Para qué sirve ollama create?', 'Compila un archivo Modelfile (-f ruta) combinando un modelo base con parámetros, SYSTEM prompt y plantillas en un nuevo modelo local.'],
        ['¿Cómo sé qué modelos tengo cargados ahora mismo en RAM/VRAM?', 'El comando ollama ps lista los modelos activos en memoria, el reparto CPU/GPU y el tiempo restante antes de descargarse.'],
        ['¿Qué es un Modelfile y qué directiva es obligatoria?', 'Es el plano de configuración de Ollama; la única directiva obligatoria es FROM, que indica el modelo base del registro o la ruta al archivo GGUF.'],
        ['¿Qué parámetro controla la creatividad frente al determinismo?', 'PARAMETER temperature: valores bajos (0.1–0.3) producen respuestas estables y factuales; valores altos (0.8–1.2) incrementan la variedad.'],
        ['¿Por qué Gemma3:4b es ideal para equipos modestos?', 'En cuantización Q4 ocupa unos 2.5 GB, corre fluido en 4 GB de RAM libre y sigue con precisión instrucciones SYSTEM en español e inglés.'],
        ['¿Qué diferencia hay entre LoRA y QLoRA?', 'LoRA congela el modelo base en 16 bits y entrena adaptadores ligeros; QLoRA cuantiza el modelo base a 4 bits NF4, reduciendo drásticamente la VRAM necesaria.'],
        ['¿Qué hace FastLanguageModel.from_pretrained en Unsloth?', 'Carga el modelo y tokenizador optimizados con kernels propios de Unsloth y soporte directo para load_in_4bit=True.'],
        ['¿Qué valores son recomendables para r y lora_alpha en 4B?', 'Un rango r=16 con lora_alpha=16 (o 2*r = 32) ofrece excelente equilibrio entre capacidad de adaptación y consumo de memoria.'],
        ['¿Por qué se usa optim="adamw_8bit" en SFTTrainer?', 'Almacena los estados del optimizador AdamW en 8 bits en lugar de 32 bits, ahorrando gigabytes de VRAM sin degradar la convergencia.'],
        ['¿Cómo paso de adaptadores LoRA a un archivo usable por Ollama?', 'Primero fusionas los pesos con save_pretrained_merged (16-bit) y luego conviertes y cuantizas a GGUF (ej. q4_k_m) para referenciarlo en FROM.'],
        ['¿Qué corrige el parche del issue #2604 de Unsloth?', 'Reescribe la línea FROM del Modelfile autogenerado cuando apunta por error al modelo F16 pesado, asegurando que Ollama cargue el GGUF cuantizado Q4_K_M.'],
        ['¿Cuántos ejemplos mínimos exige SLMFineTunerPipeline para hacer split eval?', 'Al menos 10 ejemplos en el JSONL para dividir 90% train y 10% eval; por debajo entrena sin conjunto de validación.'],
        ['¿Qué ocurre si ejecuto Automated-SLM-Fine-Tuning-Tool sin GPU NVIDIA?', 'El pipeline detecta la ausencia de GPU/Unsloth y activa automáticamente la ruta fallback CPU basada en transformers + peft en FP32.'],
        ['¿Qué plataforma gratuita ofrece GPUs donadas para modelos propios?', 'Public AI integrado como Inference Provider en Hugging Face permite inferencia en GPU con vLLM hasta 20 peticiones por minuto con clave gratuita.'],
        ['¿Cuál es la limitación principal de GitHub Models?', 'Ofrece una cuota gratuita generosa (150 req/día en modelos del catálogo), pero actualmente no permite subir pesos propios fine-tuneados.'],
        ['¿Por qué elegir Qwen3 4B o Ministral 3B para tool calling?', 'Porque fueron entrenados específicamente para function calling y destacan en juicio: saben abstenerse de llamar herramientas cuando hay negación o duda.'],
        ['¿Qué ventana de contexto ofrece Qwen3 4B Instruct?', 'Alcanza hasta 256K tokens nativos bajo licencia Apache 2.0, ideal para pasar definiciones extensas de múltiples herramientas.'],
        ['¿Qué formato XML usa Qwen3 en el Modelfile de herramientas?', 'Declara las firmas JSON Schema dentro de <tools>...</tools> en el SYSTEM y emite las invocaciones dentro de <tool_call>...</tool_call>.'],
        ['¿Qué es MCP en el contexto de agentes locales?', 'Model Context Protocol: un estándar abierto para conectar modelos locales con servidores modulares de herramientas (tiempo, archivos, bases de datos).'],
        ['¿Cómo elimino un modelo que ya no necesito en Ollama?', 'Ejecuta ollama rm nombre-del-modelo para liberar el espacio en disco de sus capas asociadas.'],
        ['¿Qué comando muestra el Modelfile interno de un modelo descargado?', 'ollama show <modelo> --modelfile imprime las directivas TEMPLATE, PARAMETER y SYSTEM configuradas en él.'],
        ['¿Qué mide eval_loss antes y después del fine-tuning?', 'Cuantifica la pérdida sobre el conjunto de validación reservado; comparar Baseline Pre-FT frente a Post-FT confirma si el entrenamiento generalizó bien.'],
        ['¿Por qué evitar respuestas de más de 600 palabras en el dataset?', 'Los ejemplos excesivamente largos consumen contexto, elevan la VRAM de activación y vuelven verboso al modelo incluso en preguntas simples.'],
        ['¿Qué puerto expone la UI web de Automated-SLM-Fine-Tuning-Tool?', 'Al ejecutar python app_ui3.py la interfaz NiceGUI queda disponible localmente en localhost puerto 8080.']
      ]
    };

    export const DATASET_200 = [];
    (function build200Dataset() {
      var domains = [
        { key: 'fiscal', label: 'Fiscal España' },
        { key: 'odoo', label: 'Odoo ERP' },
        { key: 'python', label: 'Python / CodeInsight' },
        { key: 'ollama', label: 'Ollama & Fine-Tuning' }
      ];
      var variants = [
        { prefix: '', note: '' },
        { prefix: 'En la práctica, ', note: ' (Caso aplicado)' }
      ];
      var idCounter = 1;
      for (var d = 0; d < domains.length; d++) {
        var dom = domains[d];
        var baseList = DATASET_RAW_TEMPLATES[dom.key];
        for (var v = 0; v < variants.length; v++) {
          for (var i = 0; i < baseList.length; i++) {
            var q = baseList[i][0];
            var a = baseList[i][1];
            if (v === 1) {
              q = 'Contexto técnico — ' + q;
              a = a + ' Conviene verificar la documentación vigente o validar con un caso de prueba antes de pasar a producción.';
            }
            DATASET_200.push({
              id: idCounter++,
              domain: dom.key,
              domainLabel: dom.label,
              variant: v,
              user: q,
              assistant: a
            });
          }
        }
      }
    })();

export const UNSLOTH_SNIPPETS = {
      load: {
        title: 'Paso 1 · Carga cuantizada en 4 bits con FastLanguageModel',
        code: 'from unsloth import FastLanguageModel\nimport torch\n\nmodel_name = "google/gemma-3-4b-it"\nmodel, tokenizer = FastLanguageModel.from_pretrained(\n    model_name=model_name,\n    max_seq_length=4096,\n    dtype=None,\n    load_in_4bit=True,\n    device_map="auto"\n)'
      },
      lora: {
        title: 'Paso 2 · Configuración de adaptadores LoRA (QLoRA)',
        code: 'model = FastLanguageModel.get_peft_model(\n    model,\n    r=16,\n    target_modules=[\n        "q_proj", "k_proj", "v_proj", "o_proj",\n        "gate_proj", "up_proj", "down_proj"\n    ],\n    lora_alpha=16,\n    lora_dropout=0,\n    bias="none",\n    use_gradient_checkpointing=True,\n    random_state=42\n)'
      },
      data: {
        title: 'Paso 3 · Conversión JSONL al formato nativo de Gemma3',
        code: 'from datasets import load_dataset\n\ndataset = load_dataset("json", data_files="./dataset_200_qa.jsonl", split="train")\n\ndef format_conversation(messages):\n    text = ""\n    for msg in messages:\n        role = msg["role"]\n        content = msg["content"]\n        if role == "user":\n            text += f"<start_of_turn>user\\n{content}<end_of_turn>\\n"\n        elif role == "assistant":\n            text += f"<start_of_turn>model\\n{content}<end_of_turn>\\n"\n    return text\n\ndef tokenize_function(examples):\n    texts = [format_conversation(msgs) for msgs in examples["messages"]]\n    tokenized = tokenizer(texts, truncation=True, padding=False, max_length=4096)\n    tokenized["labels"] = tokenized["input_ids"].copy()\n    return tokenized\n\ntokenized_dataset = dataset.map(tokenize_function, batched=True, remove_columns=["messages"])'
      },
      train: {
        title: 'Paso 4 · Entrenamiento supervisado con SFTTrainer y AdamW 8-bit',
        code: 'from transformers import TrainingArguments\nfrom trl import SFTTrainer\n\ntrainer = SFTTrainer(\n    model=model,\n    tokenizer=tokenizer,\n    train_dataset=tokenized_dataset,\n    max_seq_length=4096,\n    args=TrainingArguments(\n        per_device_train_batch_size=2,\n        gradient_accumulation_steps=4,\n        warmup_steps=50,\n        num_train_epochs=3,\n        learning_rate=2e-4,\n        fp16=not torch.cuda.is_bf16_supported(),\n        bf16=torch.cuda.is_bf16_supported(),\n        logging_steps=10,\n        optim="adamw_8bit",\n        weight_decay=0.01,\n        lr_scheduler_type="cosine",\n        seed=42,\n        output_dir="outputs",\n        report_to="none"\n    )\n)\ntrainer.train()'
      },
      save: {
        title: 'Paso 5 · Guardar LoRA, fusionar en 16-bit y exportar a GGUF',
        code: '# Guardar solo adaptadores LoRA (pocos MB)\nmodel.save_pretrained("gemma3-4b-fiscal-lora")\ntokenizer.save_pretrained("gemma3-4b-fiscal-lora")\n\n# Fusionar LoRA con modelo base para convertir a GGUF\nmodel.save_pretrained_merged("gemma3-4b-fiscal-merged", tokenizer, save_method="merged_16bit")\n\n# Exportación directa experimental a GGUF cuantizado Q4_K_M\nmodel.save_pretrained_gguf("gemma3-4b-fiscal-gguf", tokenizer, quantization_method="q4_k_m")'
      }
    };

export const QUIZ_QUESTIONS = [
      {
        id: 'q1',
        part: 'Parte I · Cimientos',
        q: '¿Cuál es el tamaño aproximado de Gemma3:4b en su cuantización Q4 por defecto en Ollama?',
        options: ['2.5 GB', '14 GB', '500 MB', '32 GB'],
        correct: 0,
        explain: 'Gemma3:4b cuantizado en 4 bits ocupa unos 2.5 GB, por lo que corre fluido en equipos con 4 GB de RAM libre.'
      },
      {
        id: 'q2',
        part: 'Parte I · Cimientos',
        q: '¿Qué directiva es obligatoria dentro de todo Modelfile de Ollama?',
        options: ['SYSTEM', 'PARAMETER', 'FROM', 'TEMPLATE'],
        correct: 2,
        explain: 'FROM es obligatoria porque especifica el modelo base del registro (ej. gemma3:4b) o la ruta al archivo .gguf local.'
      },
      {
        id: 'q3',
        part: 'Parte I · Cimientos',
        q: '¿Qué puerto expone por defecto la API REST local de Ollama?',
        options: ['8080', '11434', '3000', '5432'],
        correct: 1,
        explain: 'Ollama sirve su API REST en el puerto 11434 (mientras que la UI NiceGUI de SLM Automator usa el 8080).'
      },
      {
        id: 'q4',
        part: 'Parte II · Especialización',
        q: '¿Cuándo conviene hacer fine-tuning en lugar de limitarse a un Modelfile?',
        options: [
          'Cuando solo quieres que el asistente hable en español formal',
          'Cuando necesitas conocimiento de documentación interna o formatos JSON complejos consistentes',
          'Cuando no tienes GPU ni quieres esperar ningún minuto',
          'Cuando te basta con 2 ejemplos de conversación'
        ],
        correct: 1,
        explain: 'El Modelfile no cambia los pesos ni añade conocimiento factual nuevo; el fine-tuning sí internaliza documentación y estructuras estrictas.'
      },
      {
        id: 'q5',
        part: 'Parte II · Especialización',
        q: 'En el formato universal JSONL para SFTTrainer, ¿qué clave agrupa los turnos de conversación?',
        options: ['conversations_v2', 'messages', 'prompt_list', 'qa_pairs'],
        correct: 1,
        explain: 'Cada línea del JSONL contiene {"messages": [{"role": "user", "content": ...}, {"role": "assistant", "content": ...}]}.'
      },
      {
        id: 'q6',
        part: 'Parte II · Especialización',
        q: '¿Por qué se utiliza optim="adamw_8bit" y load_in_4bit=True en Unsloth?',
        options: [
          'Para entrenar únicamente en CPU sin usar memoria RAM',
          'Para reducir drásticamente el consumo de VRAM y hacer viable QLoRA en GPUs de 6–16 GB',
          'Para desactivar las matrices de adaptación LoRA',
          'Para duplicar la longitud máxima de contexto a 512K'
        ],
        correct: 1,
        explain: 'La cuantización 4-bit del modelo base junto al optimizador de 8 bits permiten entrenar modelos de 4B en GPUs modestas como una T4 o RTX 3060.'
      },
      {
        id: 'q7',
        part: 'Parte II · Especialización',
        q: '¿Qué corrige el parche del issue #2604 en Automated-SLM-Fine-Tuning-Tool?',
        options: [
          'Un fallo de conexión con GitHub Models',
          'Reescribe la línea FROM del Modelfile para cargar el GGUF cuantizado (q4_k_m) en vez del F16 pesado',
          'Compila automáticamente NiceGUI en Windows',
          'Aumenta el número mínimo de ejemplos de 10 a 500'
        ],
        correct: 1,
        explain: 'El Modelfile autogenerado por Unsloth podía apuntar al modelo F16; el parche fuerza FROM hacia el .gguf cuantizado correcto.'
      },
      {
        id: 'q8',
        part: 'Parte III · Producción',
        q: '¿Qué opción gratuita permite desplegar tu propio modelo del Hub usando GPUs donadas (20 req/min)?',
        options: ['GitHub Models', 'Public AI integrado en Hugging Face', 'Hugging Face Inference API estándar', 'Ollama ps'],
        correct: 1,
        explain: 'Public AI ofrece inferencia con vLLM sobre GPUs donadas para modelos compatibles en Hugging Face; GitHub Models no admite modelos propios.'
      },
      {
        id: 'q9',
        part: 'Parte III · Producción',
        q: 'En el benchmark de modelos ≤4B para tool calling, ¿qué distingue a Qwen3 4B y Ministral 3B?',
        options: [
          'Que llaman a una función en el 100% de las preguntas aunque no haga falta',
          'Su criterio para abstenerse de invocar herramientas cuando hay negación o duda',
          'Que solo funcionan en precisión FP32',
          'Que tienen un contexto máximo de 2K tokens'
        ],
        correct: 1,
        explain: 'Los mejores modelos ≤4B ganan por su juicio para no disparar herramientas inapropiadamente ante negaciones o información ya presente.'
      },
      {
        id: 'q10',
        part: 'Parte IV · Proyectos',
        q: '¿Qué aporta el dataset CodeInsight en el Proyecto 1 (asistente Python)?',
        options: [
          'Solo fragmentos de HTML y CSS sin tests',
          '3.409 ejemplos con intención aclarada, código Python y una media de 3 tests unitarios',
          'Logs contables de Odoo ERP',
          'Plantillas XML de FacturaE'
        ],
        correct: 1,
        explain: 'CodeInsight combina intención, código Python y tests unitarios reales de más de 70 librerías estándar, Pandas, NumPy y Regex.'
      },
      {
        id: 'q11',
        part: 'Parte IV · Proyectos',
        q: 'En el Proyecto 3 con Qwen3, ¿qué etiquetas delimitan la llamada a función devuelta por el modelo?',
        options: ['<function_exec>...</function_exec>', '<tool_call>...</tool_call>', '<ollama_run>...</ollama_run>', '<json_api>...</json_api>'],
        correct: 1,
        explain: 'El sistema declara firmas en <tools> y el modelo devuelve la invocación JSON dentro de <tool_call>...</tool_call>.'
      },
      {
        id: 'q12',
        part: 'Parte V · Cierre',
        q: 'En SLMFineTunerPipeline, ¿cuántos ejemplos mínimos hacen falta para activar el split de evaluación 90/10?',
        options: ['Al menos 10 ejemplos', 'Exactamente 500 ejemplos', 'Mínimo 1.000 ejemplos', 'No hace split nunca'],
        correct: 0,
        explain: 'Con al menos 10 ejemplos realiza el split 90/10; si hay menos, entrena todo el conjunto sin evaluación e informa de ello.'
      }
    ];
