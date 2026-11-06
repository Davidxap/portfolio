// Featured projects. Every sentence here must be verifiable from the linked evidence.
export type Locale = "en" | "es";
type L = Record<Locale, string>;

export type Project = {
  slug: string;
  chapter: string;
  name: string;
  tagline: L;
  status: L;
  summary: L;
  built: L;
  learned: L;
  stack: string[];
  links: { kind: "repo" | "demo" | "read"; url: string }[];
  /** Two-tone accent used by the card art until real art exists. */
  hue: [string, string];
  credit?: L;
  /** Key colour taken from the project's own art or UI (project select screen). */
  color: string;
  /** Filter group on the projects screen. */
  category: "full-stack" | "tools" | "learning";
  /** David's role, e.g. "Solo, full-stack" or "Team of 7, full-stack". */
  role: L;
  /** Human-readable period, e.g. "2025 – 2026". */
  period: string;
  /** One verifiable figure for the chip, e.g. "31 Prisma models". */
  metric?: L;
  /** Where the project came from (university, team), shown beside the summary. */
  context?: L;
  /** Featured projects open the select screen and the direct view. */
  featured: boolean;
  /** Optional deep dive: titled sections, each with verifiable bullet points. */
  deep?: { title: L; lead: L; points: { label: L; text: L }[] }[];
  /** Optional "at a glance" strip of verifiable figures. */
  facts?: { label: L; value: L }[];
  /** Optional architecture write-up: layers (top to bottom), the reasons behind them, and how the work was done. */
  architecture?: {
    title: L;
    lead: L;
    layers: { name: string; role: L }[];
    decisions: { title: L; body: L }[];
    process: { title: L; steps: L[] };
  };
};

export const projects: Project[] = [
  {
    slug: "tcg-store",
    chapter: "I",
    name: "TCG Store",
    tagline: {
      en: "A trading-card store, built end to end",
      es: "Una tienda de cartas coleccionables, construida de punta a punta",
    },
    status: { en: "Advanced demo · paused", es: "Demo avanzada · en pausa" },
    summary: {
      en: "A complete Magic: The Gathering store that I designed, built and tested alone: a public storefront, a deck builder, a customer account, and an admin back office that largely runs itself. It is a deployed demo, not a live business, and the code is private.",
      es: "Una tienda completa de Magic: The Gathering que diseñé, construí y probé yo solo: vitrina pública, constructor de mazos, cuenta de cliente y un back office de administración que en gran parte se maneja solo. Es una demo desplegada, no un negocio activo, y el código es privado.",
    },
    built: {
      en: "Eight areas, each described below: the storefront and catalog, checkout and payments, a deck builder with a community, catalog automation and media, inventory management, the customer account, the admin back office, and the quality and security work behind them. Built with Next.js 16, React 19, TypeScript and PostgreSQL (Prisma), and tested with Vitest and Playwright.",
      es: "Ocho áreas, cada una descrita abajo: la vitrina y el catálogo, el checkout y los pagos, un constructor de mazos con comunidad, la automatización del catálogo y los medios, la gestión de inventario, la cuenta del cliente, el back office de administración y el trabajo de calidad y seguridad que los respalda. Construida con Next.js 16, React 19, TypeScript y PostgreSQL (Prisma), y probada con Vitest y Playwright.",
    },
    learned: {
      en: "A store is not a catalog: the hard part is keeping everything around it correct without someone watching. That taught me to design for failure first. It is also a lot of surface for one person, so the project is paused as an advanced demo.",
      es: "Una tienda no es un catálogo: lo difícil es que todo lo que la rodea siga correcto sin que nadie lo vigile. Eso me enseñó a diseñar pensando primero en el fallo. También es mucha superficie para una sola persona, por eso el proyecto está en pausa como demo avanzada.",
    },
    facts: [
      { label: { en: "Data model", es: "Modelo de datos" }, value: { en: "32 Prisma models", es: "32 modelos de Prisma" } },
      { label: { en: "Server actions", es: "Server actions" }, value: { en: "33 modules", es: "33 módulos" } },
      { label: { en: "Tests", es: "Pruebas" }, value: { en: "356 test files", es: "356 archivos de pruebas" } },
      { label: { en: "Integrations", es: "Integraciones" }, value: { en: "5 external services", es: "5 servicios externos" } },
      { label: { en: "Scheduled jobs", es: "Tareas programadas" }, value: { en: "3 cron jobs", es: "3 tareas cron" } },
      { label: { en: "Languages", es: "Idiomas" }, value: { en: "EN and ES", es: "EN y ES" } },
    ],
    deep: [
      {
        title: { en: "1. Storefront and catalog", es: "1. Vitrina y catálogo" },
        lead: {
          en: "A public store where every card shows its real price and live stock.",
          es: "Una tienda pública donde cada carta muestra su precio real y su stock en vivo.",
        },
        points: [
          {
            label: { en: "Singles and sealed products", es: "Singles y producto sellado" },
            text: { en: "Separate catalogs for single cards and sealed products such as booster boxes, browsed by game and by expansion.", es: "Catálogos separados para cartas individuales y producto sellado, como cajas de sobres, navegables por juego y por expansión." },
          },
          {
            label: { en: "Card pages", es: "Páginas de carta" },
            text: { en: "Card image, rules text, expansion, available languages and a price table by edition, condition and finish, with stock state.", es: "Imagen de la carta, texto de reglas, expansión, idiomas disponibles y una tabla de precios por edición, condición y acabado, con estado de stock." },
          },
          {
            label: { en: "Expansion pages", es: "Páginas de expansión" },
            text: { en: "Every set has its own page with featured cards, banners and its sealed products.", es: "Cada set tiene su propia página con cartas destacadas, banners y su producto sellado." },
          },
          {
            label: { en: "Preorders", es: "Preventas" },
            text: { en: "Upcoming sets appear as preorders, with the homepage hero showing the next release first.", es: "Los sets próximos aparecen como preventas, y el héroe del inicio muestra primero el próximo lanzamiento." },
          },
          {
            label: { en: "Prices in pesos", es: "Precios en pesos" },
            text: { en: "Prices are shown in Colombian pesos, converted from the stored USD rate, with price history kept per item.", es: "Los precios se muestran en pesos colombianos, convertidos desde la tasa USD guardada, con historial de precios por producto." },
          },
          {
            label: { en: "Cart that follows you", es: "Carrito que te sigue" },
            text: { en: "The cart is saved to the account, so it is the same on any device once you sign in.", es: "El carrito se guarda en la cuenta, así que es el mismo en cualquier dispositivo al iniciar sesión." },
          },
          {
            label: { en: "Two languages", es: "Dos idiomas" },
            text: { en: "Spanish and English across the whole site, each language loaded only when it is used.", es: "Español e inglés en todo el sitio, cada idioma cargado solo cuando se usa." },
          },
        ],
      },
      {
        title: { en: "2. Checkout and payments", es: "2. Checkout y pagos" },
        lead: {
          en: "Buy with local payment methods and get every step confirmed by email.",
          es: "Comprar con medios de pago locales y recibir cada paso confirmado por correo.",
        },
        points: [
          {
            label: { en: "Wompi payments", es: "Pagos con Wompi" },
            text: { en: "Checkout through the Colombian gateway Wompi, with a webhook that confirms the payment back to the store.", es: "Checkout con la pasarela colombiana Wompi, con un webhook que confirma el pago a la tienda." },
          },
          {
            label: { en: "Stock checked on the server", es: "Stock verificado en el servidor" },
            text: { en: "Availability is validated on the server before a payment is processed, so a sold-out card cannot be bought.", es: "La disponibilidad se valida en el servidor antes de procesar un pago, así que una carta agotada no se puede comprar." },
          },
          {
            label: { en: "Order lifecycle", es: "Ciclo de vida del pedido" },
            text: { en: "Seven order states from pending to refunded, an order log per order, and invoices with PDF download.", es: "Siete estados de pedido, de pendiente a reembolsado, una bitácora por pedido y facturas con descarga en PDF." },
          },
          {
            label: { en: "Transactional emails", es: "Correos transaccionales" },
            text: { en: "Welcome, password reset, order confirmation, shipping notification, preorder confirmation and back-in-stock alerts, plus a notice to the admin on new preorders.", es: "Bienvenida, restablecer contraseña, confirmación de pedido, aviso de envío, confirmación de preventa y alertas de vuelta a stock, más un aviso al admin con cada preventa nueva." },
          },
        ],
      },
      {
        title: { en: "3. Deck builder and community", es: "3. Constructor de mazos y comunidad" },
        lead: {
          en: "Build a deck, check it against the rules, and buy the cards from the store.",
          es: "Armar un mazo, revisarlo contra las reglas y comprar las cartas en la tienda.",
        },
        points: [
          {
            label: { en: "Search and availability", es: "Búsqueda y disponibilidad" },
            text: { en: "Card search with filters for mana value, rarity and availability, switching between all cards and only what is in stock.", es: "Búsqueda de cartas con filtros de coste de maná, rareza y disponibilidad, alternando entre todas las cartas y solo lo que hay en stock." },
          },
          {
            label: { en: "Analysis tools", es: "Herramientas de análisis" },
            text: { en: "Mana curve chart, a budget gauge with preset tiers, format-rule checks, Commander bracket guidance with an explanatory FAQ, and a hypergeometric probability calculator.", es: "Gráfico de curva de maná, medidor de presupuesto con niveles predefinidos, validación de reglas por formato, guía de brackets de Commander con una FAQ explicativa y una calculadora de probabilidad hipergeométrica." },
          },
          {
            label: { en: "Import and export", es: "Importar y exportar" },
            text: { en: "Import a deck list, export to Moxfield, Arena, MTGO or plain text, and export the deck as an image.", es: "Importar una lista de mazo, exportar a Moxfield, Arena, MTGO o texto plano, y exportar el mazo como imagen." },
          },
          {
            label: { en: "Compare decks", es: "Comparar mazos" },
            text: { en: "A comparison tool with charts to put two decks side by side.", es: "Una herramienta de comparación con gráficos para poner dos mazos lado a lado." },
          },
          {
            label: { en: "Community decks", es: "Mazos de la comunidad" },
            text: { en: "Public decks with an explorer and tags, likes, ratings, comments with reactions, and related-deck suggestions.", es: "Mazos públicos con un explorador y etiquetas, likes, calificaciones, comentarios con reacciones y sugerencias de mazos relacionados." },
          },
          {
            label: { en: "Guided and mobile", es: "Guiado y móvil" },
            text: { en: "A builder tour for new users, and a phone layout with collapsible filters and a fixed bar to view the deck.", es: "Un recorrido guiado para usuarios nuevos y un diseño para móvil con filtros plegables y una barra fija para ver el mazo." },
          },
        ],
      },
      {
        title: { en: "4. Catalog automation and media", es: "4. Automatización del catálogo y medios" },
        lead: {
          en: "New sets come out all the time. The store keeps its catalog, prices and artwork current without anyone doing it by hand.",
          es: "Salen sets nuevos todo el tiempo. La tienda mantiene su catálogo, precios y arte al día sin que nadie lo haga a mano.",
        },
        points: [
          {
            label: { en: "Daily sync, 03:00 UTC", es: "Sincronización diaria, 03:00 UTC" },
            text: { en: "Updates the USD to COP rate, finds new sets on Scryfall, imports sealed products from MTGJSON, validates artwork and syncs prices, each as a separate step.", es: "Actualiza la tasa USD a COP, detecta sets nuevos en Scryfall, importa producto sellado desde MTGJSON, valida el arte y sincroniza precios, cada uno como un paso aparte." },
          },
          {
            label: { en: "Failures stay contained", es: "Los fallos quedan contenidos" },
            text: { en: "If one step fails, the others still run. The failure is logged and the admin sees the run marked as partial.", es: "Si un paso falla, los demás se ejecutan igual. El fallo se registra y el admin ve la ejecución marcada como parcial." },
          },
          {
            label: { en: "Date-driven preorders", es: "Preventas por fechas" },
            text: { en: "A future set with enough cards becomes a preorder by itself. At release the flag is cleared and items become normal stock. The homepage banner is chosen by rules, not by hand.", es: "Un set futuro con suficientes cartas pasa a preventa solo. Al lanzarse se limpia la marca y los productos pasan a stock normal. El banner del inicio se elige por reglas, no a mano." },
          },
          {
            label: { en: "Weekly image repair, Sundays 06:00 UTC", es: "Reparación semanal de imágenes, domingos 06:00 UTC" },
            text: { en: "Checks every set and sealed-product image, re-resolves broken set art and clears dead images so the page shows a placeholder. It resumes where it stopped if time runs out.", es: "Revisa cada imagen de sets y producto sellado, vuelve a resolver el arte roto y limpia las imágenes muertas para mostrar un marcador. Retoma donde quedó si se acaba el tiempo." },
          },
          {
            label: { en: "Manual control when needed", es: "Control manual cuando hace falta" },
            text: { en: "An admin media panel covers what automation gets wrong: signed Cloudinary uploads and per-set banner and cover editing. Jobs only run with a secret token.", es: "Un panel de medios del admin cubre lo que la automatización hace mal: subidas firmadas a Cloudinary y edición de banner y portada por set. Los jobs solo corren con un token secreto." },
          },
        ],
      },
      {
        title: { en: "5. Inventory management", es: "5. Gestión de inventario" },
        lead: {
          en: "Stock has to stay correct when several people, and the checkout, touch it at the same time.",
          es: "El stock tiene que seguir correcto cuando varias personas, y el checkout, lo tocan al mismo tiempo.",
        },
        points: [
          {
            label: { en: "Stock per variant", es: "Stock por variante" },
            text: { en: "Condition, language and finish, for singles and sealed products, with faceted filters, search and selection over large lists.", es: "Condición, idioma y acabado, para singles y producto sellado, con filtros por facetas, búsqueda y selección sobre listas grandes." },
          },
          {
            label: { en: "No lost updates", es: "Sin actualizaciones perdidas" },
            text: { en: "Each stock row carries a version number and every write checks it, so two people editing at once cannot silently overwrite each other. Bulk edits, CSV import and checkout follow the same rule, and an integration test reproduces the race.", es: "Cada fila de stock lleva un número de versión y cada escritura lo verifica, así que dos personas editando a la vez no se pisan en silencio. Las ediciones masivas, la importación CSV y el checkout siguen la misma regla, y una prueba de integración reproduce la carrera." },
          },
          {
            label: { en: "Audit trail", es: "Bitácora de auditoría" },
            text: { en: "Every stock change is logged, with separate logs for singles and sealed, and can be exported.", es: "Cada cambio de stock queda registrado, con bitácoras separadas para singles y sellado, y se puede exportar." },
          },
          {
            label: { en: "CSV tools and alerts", es: "Herramientas CSV y alertas" },
            text: { en: "CSV import normalizes card names and shows a preview before applying. CSV export and low-stock alerts are built in.", es: "La importación CSV normaliza nombres de cartas y muestra una vista previa antes de aplicar. Incluye exportación CSV y alertas de stock bajo." },
          },
          {
            label: { en: "Prices a human sets stay set", es: "Los precios fijados a mano se respetan" },
            text: { en: "Automatic price sync never overwrites a price the admin set manually.", es: "La sincronización automática nunca pisa un precio fijado a mano por el admin." },
          },
        ],
      },
      {
        title: { en: "6. Customer account", es: "6. Cuenta del cliente" },
        lead: {
          en: "One place for everything a buyer needs after signing up.",
          es: "Un solo lugar para todo lo que un comprador necesita después de registrarse.",
        },
        points: [
          {
            label: { en: "Sign-in options", es: "Opciones de inicio de sesión" },
            text: { en: "Email and password or Google, with password reset by email.", es: "Correo y contraseña o Google, con restablecimiento de contraseña por correo." },
          },
          {
            label: { en: "Orders", es: "Pedidos" },
            text: { en: "Paginated history with seven order states and a button to reorder a past order.", es: "Historial paginado con siete estados y un botón para volver a pedir un pedido anterior." },
          },
          {
            label: { en: "Favorites and alerts", es: "Favoritos y alertas" },
            text: { en: "Saved cards that notify you when they are back in stock, plus a notification inbox.", es: "Cartas guardadas que te avisan cuando vuelven a tener stock, más un buzón de notificaciones." },
          },
          {
            label: { en: "Decks and addresses", es: "Mazos y direcciones" },
            text: { en: "Saved decks and shipping addresses in the same account area.", es: "Mazos guardados y direcciones de envío en la misma área de cuenta." },
          },
          {
            label: { en: "Security", es: "Seguridad" },
            text: { en: "Two-factor authentication with authenticator apps, and one click to sign out of other devices.", es: "Autenticación de dos factores con apps de autenticación y un clic para cerrar sesión en otros dispositivos." },
          },
          {
            label: { en: "Built for phones too", es: "Pensado también para móvil" },
            text: { en: "Every tab has its own URL, and phones get a bottom tab bar.", es: "Cada pestaña tiene su propia URL y en el móvil hay una barra de pestañas inferior." },
          },
        ],
      },
      {
        title: { en: "7. Admin back office", es: "7. Back office de administración" },
        lead: {
          en: "Run the store from one place and see problems before a customer does.",
          es: "Manejar la tienda desde un solo lugar y ver los problemas antes que un cliente.",
        },
        points: [
          {
            label: { en: "Dashboard", es: "Panel" },
            text: { en: "Net profit, orders, stock alerts and completion rate for the month, the year or all time, with a revenue chart and a recent-activity feed.", es: "Utilidad neta, pedidos, alertas de stock y tasa de cumplimiento del mes, del año o total, con un gráfico de ingresos y un feed de actividad reciente." },
          },
          {
            label: { en: "System status", es: "Estado del sistema" },
            text: { en: "Live status of the database, the Wompi payment gateway and the exchange-rate feed.", es: "Estado en vivo de la base de datos, la pasarela de pagos Wompi y la fuente de tasa de cambio." },
          },
          {
            label: { en: "Orders and invoices", es: "Pedidos y facturas" },
            text: { en: "Orders with state filters, search by ID, payment ID or user, a date range and CSV export. Invoices with PDF download, reconciled daily by a job.", es: "Pedidos con filtros por estado, búsqueda por ID, ID de pago o usuario, rango de fechas y exportación CSV. Facturas con descarga en PDF, conciliadas a diario por un job." },
          },
          {
            label: { en: "Catalog operations", es: "Operaciones de catálogo" },
            text: { en: "Inventory, sealed products, preorders, set lifecycle and the media panel, each with its own screen.", es: "Inventario, producto sellado, preventas, ciclo de vida de sets y panel de medios, cada uno con su propia pantalla." },
          },
          {
            label: { en: "Users and guide", es: "Usuarios y guía" },
            text: { en: "User management with a detail page per user, and an in-panel guide that explains how to operate the store.", es: "Gestión de usuarios con una página de detalle por usuario y una guía dentro del panel que explica cómo operar la tienda." },
          },
          {
            label: { en: "Visible failures", es: "Fallos visibles" },
            text: { en: "The set lifecycle screen shows the last automated run, its status and any failure message.", es: "La pantalla de ciclo de vida de sets muestra la última ejecución automática, su estado y cualquier mensaje de fallo." },
          },
        ],
      },
      {
        title: { en: "8. Quality, security and performance", es: "8. Calidad, seguridad y rendimiento" },
        lead: {
          en: "I audited my own work, fixed what I found, and kept the site fast.",
          es: "Audité mi propio trabajo, corregí lo que encontré y mantuve el sitio rápido.",
        },
        points: [
          {
            label: { en: "Own audit", es: "Auditoría propia" },
            text: { en: "An exhaustive admin pass on a local copy of the production catalog, a security review, and a written remediation plan done one task at a time.", es: "Una revisión exhaustiva del admin sobre una copia local del catálogo de producción, una revisión de seguridad y un plan de remediación escrito, ejecutado tarea por tarea." },
          },
          {
            label: { en: "Fixes shipped", es: "Correcciones entregadas" },
            text: { en: "Critical framework vulnerabilities patched, an exposed debug endpoint removed, webhook and cron authentication tightened, a minimum password length, and a generic response on duplicate sign-ups so accounts cannot be enumerated. The production dependency audit reported zero known vulnerabilities after the fix.", es: "Vulnerabilidades críticas del framework parcheadas, un endpoint de depuración expuesto eliminado, autenticación de webhook y cron reforzada, longitud mínima de contraseña y una respuesta genérica ante registros duplicados para que no se puedan enumerar cuentas. La auditoría de dependencias de producción reportó cero vulnerabilidades conocidas tras la corrección." },
          },
          {
            label: { en: "Built-in protections", es: "Protecciones incluidas" },
            text: { en: "Security headers, per-IP rate limiting on sign-in and admin routes, trusted-origin checks, and no secrets in the browser.", es: "Encabezados de seguridad, límite de tasa por IP en inicio de sesión y rutas de admin, verificación de orígenes de confianza y ningún secreto en el navegador." },
          },
          {
            label: { en: "Performance", es: "Rendimiento" },
            text: { en: "A cached, rate-limited Scryfall client, a custom image loader that avoids serverless timeouts, streamed catalog pages and language files loaded on demand.", es: "Un cliente de Scryfall con caché y límite de tasa, un cargador de imágenes propio que evita timeouts en serverless, páginas de catálogo en streaming y archivos de idioma cargados bajo demanda." },
          },
          {
            label: { en: "A gate on every change", es: "Una compuerta en cada cambio" },
            text: { en: "Type check, unit suite and lint with zero errors before a change counts as done.", es: "Verificación de tipos, suite unitaria y lint con cero errores antes de dar un cambio por terminado." },
          },
        ],
      },
    ],
    architecture: {
      title: { en: "Architecture and the reasons behind it", es: "Arquitectura y las razones detrás" },
      lead: {
        en: "Front end and back end live in one Next.js codebase on purpose. This is how the pieces fit, why I drew the lines where I did, and how the work was carried out.",
        es: "Front end y back end viven en un solo código de Next.js a propósito. Así encajan las piezas, por qué tracé las líneas donde las tracé y cómo se llevó a cabo el trabajo.",
      },
      layers: [
        {
          name: "Browser",
          role: {
            en: "React 19 client components only where interaction needs them (deck builder, inventory grid, dashboards). Cart and favorites live in Zustand stores kept in localStorage.",
            es: "Componentes cliente de React 19 solo donde la interacción lo exige (constructor de mazos, grilla de inventario, paneles). El carrito y los favoritos viven en stores de Zustand guardados en localStorage.",
          },
        },
        {
          name: "Next.js App Router",
          role: {
            en: "Server components render the catalog pages. A request proxy runs first (origin checks, session-cookie gate, per-IP rate limiting). Mutations are server actions (33 action modules); real HTTP endpoints exist only for webhooks, cron jobs and exports.",
            es: "Los componentes de servidor renderizan las páginas del catálogo. Un proxy de peticiones corre primero (verificación de origen, control de cookie de sesión, límite de tasa por IP). Las mutaciones son server actions (33 módulos de acciones); los endpoints HTTP reales existen solo para webhooks, jobs de cron y exportaciones.",
          },
        },
        {
          name: "Feature modules",
          role: {
            en: "Code is organised by domain, not by file type: admin, auth, catalog, checkout, deck-builder, home and inventory each own their actions, components and services, on top of a shared layer.",
            es: "El código se organiza por dominio y no por tipo de archivo: admin, auth, catalog, checkout, deck-builder, home e inventory tienen cada uno sus acciones, componentes y servicios, sobre una capa compartida.",
          },
        },
        {
          name: "Prisma + PostgreSQL",
          role: {
            en: "32 models on Supabase Postgres, with a separate direct URL configured for migrations. One typed schema feeds every layer above it.",
            es: "32 modelos en Postgres de Supabase, con una URL directa aparte configurada para las migraciones. Un solo esquema tipado alimenta todas las capas de arriba.",
          },
        },
        {
          name: "External services",
          role: {
            en: "Scryfall (cards, sets, prices), MTGJSON (sealed products), Wompi (payments and webhook), Cloudinary (media), Resend (email). Each sits behind a service module so jobs and admin actions share one implementation.",
            es: "Scryfall (cartas, sets, precios), MTGJSON (producto sellado), Wompi (pagos y webhook), Cloudinary (medios), Resend (correo). Cada uno está detrás de un módulo de servicio para que los jobs y las acciones del admin compartan una sola implementación.",
          },
        },
        {
          name: "Scheduled jobs",
          role: {
            en: "Three Vercel cron routes: daily catalog sync, daily invoice reconciliation, weekly image healing. Each is authenticated with a secret and reports its result to a log table the admin can read.",
            es: "Tres rutas de cron de Vercel: sincronización diaria del catálogo, conciliación diaria de facturas y reparación semanal de imágenes. Cada una se autentica con un secreto y reporta su resultado a una tabla de registro que el admin puede leer.",
          },
        },
      ],
      decisions: [
        {
          title: { en: "Why front and back in one codebase", es: "Por qué front y back en un solo código" },
          body: {
            en: "I built it alone. Server components and server actions share Prisma's generated types end to end, so changing a column breaks the compiler where the UI uses it instead of breaking a customer. One deployable unit also removes a whole class of drift: no separate API contract, no CORS, no two deploys to keep in sync. When a real endpoint is needed (webhooks, crons, CSV export), a route handler does it inside the same project.",
            es: "Lo construí yo solo. Los componentes de servidor y las server actions comparten los tipos generados de Prisma de punta a punta, así que cambiar una columna rompe el compilador donde la interfaz la usa y no a un cliente. Una sola unidad desplegable también elimina toda una clase de desfases: sin contrato de API aparte, sin CORS, sin dos despliegues que sincronizar. Cuando hace falta un endpoint real (webhooks, crons, exportación CSV), un route handler lo resuelve dentro del mismo proyecto.",
          },
        },
        {
          title: { en: "Why concurrency lives in the database", es: "Por qué la concurrencia vive en la base de datos" },
          body: {
            en: "On a serverless host many instances run at once, so an in-memory lock protects nothing. Stock rows carry a version number and every write is a conditional update, so the database decides who wins. Bulk edit, CSV import and checkout all go through the same rule, and an integration test exercises the race.",
            es: "En un host serverless corren muchas instancias a la vez, así que un bloqueo en memoria no protege nada. Las filas de stock llevan un número de versión y cada escritura es una actualización condicional, de modo que la base de datos decide quién gana. La edición masiva, la importación CSV y el checkout pasan por la misma regla, y una prueba de integración ejercita la carrera.",
          },
        },
        {
          title: { en: "Why jobs are split into isolated steps", es: "Por qué los jobs se dividen en pasos aislados" },
          body: {
            en: "A card store depends on third-party data that fails in small ways: one set has no price, one image is gone. If one failure aborted the run, the rest of the catalog would go stale. Each step is wrapped so a failure is recorded and the run continues, and the admin sees the result on the lifecycle screen instead of finding out from a customer.",
            es: "Una tienda de cartas depende de datos de terceros que fallan de a poco: un set sin precio, una imagen que desapareció. Si un fallo abortara la ejecución, el resto del catálogo quedaría desactualizado. Cada paso está envuelto para que el fallo se registre y la ejecución siga, y el admin ve el resultado en la pantalla de ciclo de vida en lugar de enterarse por un cliente.",
          },
        },
        {
          title: { en: "Why manual overrides always win", es: "Por qué los ajustes manuales siempre ganan" },
          body: {
            en: "Automation is only trusted if it cannot undo a human decision. Price sync checks a per-item price mode before writing, and the admin media panel exists for exactly the cases the automatic art resolver gets wrong.",
            es: "Una automatización solo es confiable si no puede deshacer una decisión humana. La sincronización de precios revisa un modo de precio por producto antes de escribir, y el panel de medios del admin existe justo para los casos en que el resolvedor automático de arte se equivoca.",
          },
        },
        {
          title: { en: "What is still open, written down", es: "Lo que sigue abierto, por escrito" },
          body: {
            en: "Known gaps are tracked rather than hidden: a technical-debt file in the repository and a staged plan with the unfinished tasks. For example, my own scaling audit found that rate limits and some caches were kept per instance, and moving them to shared storage is a planned task that needs an infrastructure decision.",
            es: "Los huecos conocidos se registran en lugar de esconderse: un archivo de deuda técnica en el repositorio y un plan por etapas con las tareas sin terminar. Por ejemplo, mi propia auditoría de escalado encontró que los límites de tasa y algunas cachés se guardaban por instancia, y moverlos a almacenamiento compartido es una tarea planificada que necesita una decisión de infraestructura.",
          },
        },
      ],
      process: {
        title: { en: "How the work was done", es: "Cómo se hizo el trabajo" },
        steps: [
          {
            en: "Write the requirements down first, quoting the exact wording of each one, then break them into numbered tasks, each linked to the requirement it satisfies.",
            es: "Escribir primero los requisitos citando la redacción exacta de cada uno y luego partirlos en tareas numeradas, cada una ligada al requisito que cumple.",
          },
          {
            en: "Work on a branch per phase with small commits, tests next to the behavior they cover, and one gate per commit: type check, the unit suite and lint with zero errors.",
            es: "Trabajar en una rama por fase con commits pequeños, pruebas junto al comportamiento que cubren y una compuerta por commit: verificación de tipos, suite unitaria y lint con cero errores.",
          },
          {
            en: "Test against reality: a local copy of the production catalog (read-only, no users or orders) to run an exhaustive admin pass, which surfaced real defects such as case-duplicated set codes breaking search.",
            es: "Probar contra la realidad: una copia local del catálogo de producción (solo lectura, sin usuarios ni pedidos) para hacer una pasada exhaustiva del admin, que destapó defectos reales como códigos de set duplicados por mayúsculas que rompían la búsqueda.",
          },
          {
            en: "Deploy in small merged pull requests and check the live site right after each one. A dependency upgrade once broke sign-in on the deployed demo because of database columns it needed; the post-deploy check caught it, I rolled the version back, and re-applied it after the migration was in place.",
            es: "Desplegar con pull requests pequeños y revisar el sitio en vivo justo después de cada uno. Una actualización de dependencia rompió una vez el inicio de sesión en la demo desplegada por columnas de base de datos que necesitaba; la revisión posterior al despliegue lo detectó, revertí la versión y la volví a aplicar con la migración ya hecha.",
          },
          {
            en: "Keep the notes: a runbook for production, a document of golden rules (back up before risky changes, document the rollback) and the debt tracker, so the project can be picked up again after a pause.",
            es: "Mantener las notas: un runbook de producción, un documento de reglas de oro (respaldar antes de cambios riesgosos, documentar la reversión) y el registro de deuda, para poder retomar el proyecto después de una pausa.",
          },
        ],
      },
    },
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Prisma", "better-auth", "Cloudinary", "Vitest", "Playwright"],
    links: [{ kind: "demo", url: "https://tcg-store-sage.vercel.app" }],
    hue: ["#3d2f26", "#f0b07c"],
    color: "#b25cff",
    category: "full-stack",
    role: { en: "Solo, full-stack", es: "Solo, full-stack" },
    period: "2025 – 2026",
    metric: { en: "32 Prisma models", es: "32 modelos de Prisma" },
    featured: true,
  },
  {
    slug: "amplixme-fs-0009",
    chapter: "II",
    name: "AmplixMe FS-0009",
    tagline: {
      en: "A full-stack blog with comments, built by a team of seven",
      es: "Un blog full-stack con comentarios, construido por un equipo de siete",
    },
    status: { en: "Finished · team project in a training program", es: "Terminado · proyecto en equipo de un programa de formación" },
    context: {
      en: "A team project I joined to learn to work the way real teams do: tickets, branches, reviews.",
      es: "Un proyecto en equipo al que me uní para aprender a trabajar como trabajan los equipos reales: tickets, ramas, revisiones.",
    },
    summary: {
      en: "A complete blog with comments (Node.js, Express, Prisma, PostgreSQL and a Vite + React front end with JWT authentication), built by 7 contributors in the AmplixMe acceleration program, a training program and not a job. I joined it to learn to work the way real teams do: tickets, branches, reviews. I merged 16 pull requests across both halves of the stack, from the JWT login endpoint to the demo seed script.",
      es: "Un blog completo con comentarios (Node.js, Express, Prisma, PostgreSQL y un front end con Vite + React y autenticación JWT), construido por 7 contribuidores en el programa de aceleración de AmplixMe, un programa de formación y no un empleo. Me uní para aprender a trabajar como trabajan los equipos reales: tickets, ramas, revisiones. Integré 16 pull requests en las dos mitades del stack, desde el endpoint de login con JWT hasta el script de datos de demo.",
    },
    built: {
      en: "Back end: the JWT login endpoint and routes aggregator, an image upload endpoint backed by Cloudinary, and a seed script that loads 4 users, 5 categories, 15 posts and 30 comments into PostgreSQL and can be re-run safely. Front end: the post detail page, edit page with a reusable form, delete confirmation with a modal and toast, category filter and badges, edit and delete for comments with a comment-count badge, a search bar with results, sort and filter controls on the home page, and a responsive review for mobile. The team worked through tickets, feature branches and pull requests, with a documented API and pnpm supply-chain hardening notes in the repository.",
      es: "Back end: el endpoint de login con JWT y el agregador de rutas, un endpoint de subida de imágenes con Cloudinary y un script de seed que carga 4 usuarios, 5 categorías, 15 posts y 30 comentarios en PostgreSQL y puede ejecutarse varias veces sin riesgo. Front end: la página de detalle de un post, la página de edición con un formulario reutilizable, la confirmación de borrado con modal y aviso, el filtro y las etiquetas de categoría, editar y borrar comentarios con un contador de comentarios, una barra de búsqueda con resultados, controles de orden y filtro en el inicio y una revisión responsive para móvil. El equipo trabajó con tickets, ramas de funcionalidad y pull requests, con la API documentada y notas de endurecimiento de la cadena de suministro con pnpm en el repositorio.",
    },
    learned: {
      en: "Working the way a team works: small tickets, feature branches, pull requests, and a seed script so anyone can run the demo in minutes. Sharing a codebase with six other people taught me to keep changes small and to write them so the next person can read them.",
      es: "Trabajar como trabaja un equipo: tickets pequeños, ramas de funcionalidad, pull requests y un script de seed para que cualquiera pueda correr la demo en minutos. Compartir el código con otras seis personas me enseñó a mantener los cambios pequeños y a escribirlos para que la siguiente persona los lea con facilidad.",
    },
    stack: ["Node.js", "Express", "Prisma", "PostgreSQL", "React", "Vite", "JWT", "Cloudinary"],
    links: [
      { kind: "repo", url: "https://github.com/amplixme/FS-0009" },
      { kind: "read", url: "https://github.com/amplixme/FS-0009/pulls?q=is%3Apr+author%3ADavidxap+is%3Amerged" },
    ],
    hue: ["#2a3340", "#7fb2e0"],
    color: "#4f9de8",
    category: "full-stack",
    role: { en: "Team of 7, full-stack", es: "Equipo de 7, full-stack" },
    period: "Jul – Aug 2026",
    metric: { en: "16 merged PRs, team of 7", es: "16 PRs integrados, equipo de 7" },
    featured: true,
  },
  {
    slug: "ikai",
    chapter: "III",
    name: "IKAI Shell",
    tagline: {
      en: "A desktop shell for Omarchy Linux",
      es: "Un shell de escritorio para Omarchy Linux",
    },
    status: { en: "Open source (MIT) · beta (v0.2.0)", es: "Open source (MIT) · beta (v0.2.0)" },
    summary: {
      en: "A bar and Control Center for the Omarchy desktop (Arch Linux + Hyprland), written in QML on Quickshell and inspired by Junji Ito and Silent Hill. Its bar engine is a fork of Shibumi-Shell by HANCORE (MIT) and is mostly their code; the Control Center, the widgets and the icon-generation scripts are my work. It follows whichever Omarchy theme is active, light or dark. The code is MIT-licensed; the artwork has its own terms.",
      es: "Una barra y un Centro de control para el escritorio Omarchy (Arch Linux + Hyprland), escrita en QML sobre Quickshell e inspirada en Junji Ito y Silent Hill. Su motor de barra es un fork de Shibumi-Shell de HANCORE (MIT) y es en su mayoría código de ellos; el Centro de control, los widgets y los scripts que generan los iconos son trabajo mío. Sigue el tema activo de Omarchy, claro u oscuro. El código es MIT; el arte tiene sus propios términos.",
    },
    built: {
      en: "A Control Center with eleven pages (Styles, Bars, Icons, Logo, Effects, Workspaces, Colors, Plugins, Setup, Boot & Lock, Health) with search, foldable sections, undo and per-section reset. The bar can sit on any of the four screen edges in five shapes (Islands, Full, Fit, Dock, Notch). Engraved-style icons, each switchable between Original, Ink, Relic and Hollow drawings, and workspace markers in several styles (seals, rings, spirals, eyes, and more) or your own pictures. Seven ready-made bar profiles plus saved ones, popups drawn as manga panels (audio, network, calendar, forecast, media, notifications), hover animations that cost nothing at rest, a Health page with Fix buttons that writes a report any AI assistant can read, and a generated asset pipeline for every bar size. Requires Omarchy 4.0.6 or newer.",
      es: "Un Centro de control con once páginas (Styles, Bars, Icons, Logo, Effects, Workspaces, Colors, Plugins, Setup, Boot & Lock, Health) con búsqueda, secciones plegables, deshacer y reinicio por sección. La barra puede ir en cualquiera de los cuatro bordes de la pantalla en cinco formas (Islands, Full, Fit, Dock, Notch). Iconos de estilo grabado, cada uno intercambiable entre dibujos Original, Ink, Relic y Hollow, y marcadores de espacios de trabajo en varios estilos (sellos, anillos, espirales, ojos y más) o con imágenes propias. Siete perfiles de barra prediseñados más los que guardes, popups dibujados como paneles de manga (audio, red, calendario, pronóstico, multimedia, notificaciones), animaciones al pasar el cursor que no cuestan nada en reposo, una página de salud con botones de arreglo que genera un informe legible por cualquier asistente de IA, y un pipeline de assets generados para cada tamaño de barra. Requiere Omarchy 4.0.6 o superior.",
    },
    learned: {
      en: "Large visual systems need strict rules: contrast checks per theme, and performance work such as parsing a 4 MB asset index once instead of once per component. Building on someone else's engine also means keeping the credits and licences straight: the repository documents what is a fork, what is original, and which source images are not mine.",
      es: "Los sistemas visuales grandes necesitan reglas estrictas: chequeos de contraste por tema y trabajo de rendimiento, como parsear un índice de 4 MB una sola vez y no por componente. Construir sobre el motor de otra persona también exige mantener claros los créditos y las licencias: el repositorio documenta qué es un fork, qué es original y qué imágenes de origen no son mías.",
    },
    stack: ["QML", "Quickshell", "Shell", "Python"],
    links: [{ kind: "repo", url: "https://github.com/Davidxap/ikai-shell" }],
    hue: ["#2c3b3a", "#e0a27a"],
    color: "#d4566f",
    category: "tools",
    role: { en: "Solo, design and code", es: "Solo, diseño y código" },
    period: "2026",
    metric: { en: "11-page Control Center", es: "Centro de control de 11 páginas" },
    featured: true,
    credit: {
      en: "Fan art inspired by Junji Ito and Silent Hill. Unaffiliated and non-commercial.",
      es: "Fan art inspirado en Junji Ito y Silent Hill. Sin afiliación y sin uso comercial.",
    },
  },
  {
    slug: "javascript-para-subir-de-nivel",
    chapter: "IV",
    name: "JavaScript para Subir de Nivel",
    tagline: {
      en: "A learning site about how JavaScript works, in Spanish and English",
      es: "Un sitio sobre un libro de JavaScript por dentro, en español e inglés",
    },
    status: { en: "Learning project · free, no sign-up", es: "Proyecto de aprendizaje · libre, sin registro" },
    summary: {
      en: "A free learning site, in Spanish and English, that goes from using JavaScript to understanding it, in twelve chapters from functions, closures and prototypes through the event loop, modules, error handling, design patterns, state architecture and defensive security to the latest language proposals (ES2025-ES2026). Each chapter ends with review questions, an explain-it-yourself challenge and progressive coding exercises with collapsible hints and explained solutions. It is my learning project: my study notes, organised and shared.",
      es: "Un sitio de aprendizaje gratuito, en español e inglés, para pasar de usar JavaScript a entenderlo, en doce capítulos: desde funciones, closures y prototipos, pasando por el event loop, módulos, manejo de errores, patrones de diseño, arquitecturas de estado y seguridad defensiva, hasta las propuestas más recientes del lenguaje (ES2025-ES2026). Cada capítulo cierra con preguntas de repaso, un reto para explicarlo con tus palabras y ejercicios de código progresivos con pistas desplegables y soluciones explicadas. Es mi proyecto de aprendizaje: mis notas de estudio, organizadas y compartidas.",
    },
    built: {
      en: "The site on Astro with the Starlight docs engine: Spanish and English routes with reciprocal hreflang, built-in search, dark and light themes, syntax-highlighted code with copy buttons, and a bibliography page. It is built and deployed to GitHub Pages by a GitHub Actions workflow on every push. The content is Markdown, organised from my own study notes, with \"Python Connection\" and \"Java Connection\" boxes that compare each idea with languages I already knew, and short debugging scenarios per chapter.",
      es: "El sitio en Astro con el motor de documentación Starlight: rutas en español e inglés con hreflang recíproco, búsqueda integrada, temas oscuro y claro, código con resaltado de sintaxis y botón de copiar, y una página de bibliografía. Un workflow de GitHub Actions lo construye y lo despliega en GitHub Pages en cada push. El contenido está en Markdown, organizado a partir de mis notas de estudio, con cajas de \"Conexión con Python\" y \"Conexión con Java\" que comparan cada idea con lenguajes que ya conocía, y escenarios cortos de depuración por capítulo.",
    },
    learned: {
      en: "I learn by writing things down. This learning project turns my study notes into something others can use, and it was made to be shared. Comparing JavaScript with Java and Python while organising the notes showed me where my own understanding was thin, which is what the exercises and the \"explain it in your own words\" prompts are for.",
      es: "Aprendo escribiendo. Este proyecto de aprendizaje convierte mis notas de estudio en algo que otros pueden usar, y lo hice para compartirlo. Comparar JavaScript con Java y Python mientras organizaba las notas me mostró dónde mi propio entendimiento era débil, y para eso sirven los ejercicios y los retos de \"explícalo con tus palabras\".",
    },
    stack: ["Astro", "Starlight", "i18n", "GitHub Pages", "JavaScript"],
    links: [
      { kind: "read", url: "https://davidxap.github.io/javascript-para-subir-de-nivel" },
      { kind: "repo", url: "https://github.com/Davidxap/javascript-para-subir-de-nivel" },
    ],
    hue: ["#34304e", "#d9c27a"],
    color: "#7c8cff",
    category: "learning",
    role: { en: "Author and developer", es: "Autor y desarrollador" },
    period: "2025 – 2026",
    metric: { en: "12 chapters, EN and ES", es: "12 capítulos, ES e EN" },
    featured: true,
  },
  {
    slug: "omarchy-zen",
    chapter: "V",
    name: "omarchy-zen",
    tagline: {
      en: "Omarchy theme sync for the Zen browser",
      es: "Sincroniza el tema de Omarchy con el navegador Zen",
    },
    status: { en: "Open source · maintainer", es: "Open source · mantenedor" },
    summary: {
      en: "Keeps the Zen browser in the active Omarchy palette with pure CSS: no extension, no privileged preferences, no native host and no background daemon. Changing the system theme can repaint the browser live, without a restart. Installs as an Omarchy shell plugin or as a standalone script.",
      es: "Mantiene el navegador Zen con la paleta activa de Omarchy usando solo CSS: sin extensión, sin preferencias privilegiadas, sin host nativo y sin demonio en segundo plano. Al cambiar el tema del sistema, el navegador puede repintarse en vivo, sin reiniciar. Se instala como plugin del shell de Omarchy o como script independiente.",
    },
    built: {
      en: "It started as a fork of zen-auto-style by Gregory Strand (MIT, credited in the README; his original extension stays unchanged in legacy/). I added Omarchy 4.x support, a hardened CSS-only install, themed text selection and the plugin packaging. A theme-set hook re-renders the stylesheet from the resolved palette and posts a desktop notification. The renderer binary-searches the smallest darkening or lightening that keeps accent-derived text at WCAG AA contrast (4.5:1) in light and dark palettes. Opt-in live reload (./live.sh enable) uses Firefox autoconfig, polls the palette file once per second, and repaints Zen in about a second. verify.sh checks that Zen's selectors still exist after an update, and test-fresh-install.sh runs against a throwaway profile. Current version 1.4.2; a contributor's merged PR made text selection follow the theme on every website.",
      es: "Empezó como fork de zen-auto-style de Gregory Strand (MIT, con crédito en el README; su extensión original se conserva sin cambios en legacy/). Agregué soporte para Omarchy 4.x, una instalación solo CSS más robusta, selección de texto con colores del tema y el empaquetado como plugin. Un hook de theme-set vuelve a generar la hoja de estilos desde la paleta resuelta y publica una notificación de escritorio. El renderizador busca por bisección el menor oscurecimiento o aclarado que mantiene el texto derivado del acento en contraste WCAG AA (4,5:1) en paletas claras y oscuras. La recarga en vivo opcional (./live.sh enable) usa el autoconfig de Firefox, revisa el archivo de paleta una vez por segundo y repinta Zen en cerca de un segundo. verify.sh comprueba que los selectores de Zen sigan existiendo tras una actualización, y test-fresh-install.sh corre contra un perfil desechable. Versión actual 1.4.2; un PR de otra persona, ya integrado, hizo que la selección de texto siga el tema en todos los sitios.",
    },
    learned: {
      en: "Small, focused tools get used when they do one thing well and respect the user's setup. Choosing Firefox autoconfig over an extension removed two security-sensitive preferences from the install, and the tradeoff (two root-owned files in the Zen install directory) is documented openly in the README.",
      es: "Las herramientas pequeñas y enfocadas se usan cuando hacen una cosa bien y respetan la configuración del usuario. Elegir el autoconfig de Firefox en lugar de una extensión quitó dos preferencias sensibles de la instalación, y el costo (dos archivos de root en el directorio de instalación de Zen) está documentado abiertamente en el README.",
    },
    stack: ["CSS", "Shell", "Python", "QML"],
    links: [{ kind: "repo", url: "https://github.com/Davidxap/omarchy-zen" }],
    hue: ["#1f3a40", "#8fd0c2"],
    color: "#6fcfc2",
    category: "tools",
    role: { en: "Maintainer", es: "Mantenedor" },
    period: "2025 – 2026",
    metric: { en: "Verified in the Omarchy marketplace", es: "Verificado en el marketplace de Omarchy" },
    featured: true,
  },
  {
    slug: "obsidian-backend-template",
    chapter: "VI",
    name: "obsidian-backend-template",
    tagline: {
      en: "An Obsidian vault that works like a backend for AI agents",
      es: "Una bóveda de Obsidian que funciona como backend para agentes de IA",
    },
    status: { en: "Open source · MIT template", es: "Open source · plantilla MIT" },
    summary: {
      en: "A template that turns an Obsidian vault into a backend that feeds you: plain Markdown files, no database and no cloud. Scheduled Python scripts write real numbers into daily notes, AI agents log their own work, and a dashboard note shows what needs you today. Inspired by a video by Eric Michaud; an independent implementation.",
      es: "Una plantilla que convierte una bóveda de Obsidian en un backend que te alimenta: archivos Markdown planos, sin base de datos y sin nube. Scripts programados en Python escriben cifras reales en las notas diarias, los agentes de IA registran su propio trabajo y una nota de panel muestra lo que necesita tu atención hoy. Inspirada en un video de Eric Michaud; es una implementación independiente.",
    },
    built: {
      en: "Human and machine zones, so agents write only where they are allowed. Deterministic metric collectors in Python (vault statistics and a GitHub collector) that leave a value empty when a source fails instead of guessing. An AGENTS.md in every folder so an agent reads only the context it needs, per-workflow findings files that agents read before and update after each run, a daily agent activity log, and a Dataview and Tasks dashboard. A systemd user timer runs the collectors every morning, personal metrics are git-ignored by default, and a pytest suite and a GitHub Actions workflow cover the collectors. The README previews are rendered with demo data.",
      es: "Zonas humana y de máquina, para que los agentes solo escriban donde se les permite. Recolectores de métricas deterministas en Python (estadísticas de la bóveda y un recolector de GitHub) que dejan el valor vacío cuando una fuente falla en lugar de adivinar. Un AGENTS.md en cada carpeta para que el agente lea solo el contexto que necesita, archivos de hallazgos por flujo de trabajo que los agentes leen antes y actualizan después de cada ejecución, un registro diario de actividad de agentes y un panel con Dataview y Tasks. Un temporizador de usuario de systemd ejecuta los recolectores cada mañana, las métricas personales quedan fuera de git por defecto, y una suite de pytest y un workflow de GitHub Actions cubren los recolectores. Las vistas previas del README usan datos de demostración.",
    },
    learned: {
      en: "Agents work better with less context and clear boundaries, and numbers should come from scripts, not from a model's estimate. It is also how I put AI coding tools such as Claude Code and OpenCode to work with a structure around them.",
      es: "Los agentes trabajan mejor con menos contexto y límites claros, y las cifras deben salir de scripts, no de la estimación de un modelo. También es mi forma de poner a trabajar herramientas de programación con IA como Claude Code y OpenCode con una estructura a su alrededor.",
    },
    stack: ["Python", "Obsidian", "Dataview", "Markdown", "systemd", "pytest", "GitHub Actions"],
    links: [{ kind: "repo", url: "https://github.com/Davidxap/obsidian-backend-template" }],
    hue: ["#2b2440", "#a995d8"],
    color: "#a78bfa",
    category: "tools",
    role: { en: "Solo, design and code", es: "Solo, diseño y código" },
    period: "Oct 2026",
    metric: { en: "Python collectors with tests and CI", es: "Recolectores en Python con pruebas y CI" },
    featured: false,
  },
  {
    slug: "skorify-frontend",
    chapter: "VII",
    name: "Skorify (community contributions)",
    tagline: {
      en: "Two merged front-end pull requests for the AWS User Group Manizales",
      es: "Dos pull requests de front end integrados para el AWS User Group Manizales",
    },
    status: { en: "Community project · 2 merged PRs", es: "Proyecto de comunidad · 2 PRs integrados" },
    summary: {
      en: "Skorify is a sports prediction platform for groups of friends, built in the open by the AWS User Group Manizales community (Next.js, React, TypeScript, MUI). I contributed two pull requests that were merged into its front end: an admin users view and a results view with predictions and scoring badges. The project is the community's, not mine.",
      es: "Skorify es una plataforma de predicciones deportivas para grupos de amigos, construida abiertamente por la comunidad del AWS User Group Manizales (Next.js, React, TypeScript, MUI). Aporté dos pull requests que se integraron en su front end: una vista de administración de usuarios y una vista de resultados con predicciones e insignias de puntaje. El proyecto es de la comunidad, no mío.",
    },
    built: {
      en: "PR #44, merged on 28 April 2026: an admin module to view the participants of the platform, with filters by status, search, and both card and table layouts, translated with i18n (12 files, +768 lines). PR #63, merged on 19 May 2026: a results view for finished matches, inside each group and as a general page, ordered by most recent date, showing the user's prediction, a badge for exact, partial or wrong guesses and the points earned, run against mock prediction data. It also fixed a next-intl loading error caused by duplicate translation keys and a duplicated auth-store import (16 files).",
      es: "PR #44, integrado el 28 de abril de 2026: un módulo de administración para ver a los participantes de la plataforma, con filtros por estado, búsqueda y vistas en tarjetas y en tabla, traducido con i18n (12 archivos, +768 líneas). PR #63, integrado el 19 de mayo de 2026: una vista de resultados de partidos finalizados, dentro de cada grupo y como página general, ordenados por fecha más reciente, que muestra la predicción del usuario, una insignia para aciertos exactos, parciales o fallidos y los puntos obtenidos, sobre datos de predicciones simulados. También corrigió un error de carga de next-intl causado por claves de traducción duplicadas y una importación duplicada del store de autenticación (16 archivos).",
    },
    learned: {
      en: "Contributing to someone else's codebase: working inside its structure and translation setup, opening pull requests tied to an issue with a clear description, and fixing what I found along the way.",
      es: "Contribuir al código de otras personas: trabajar dentro de su estructura y su configuración de traducciones, abrir pull requests ligados a un issue con una descripción clara y arreglar lo que encontré en el camino.",
    },
    stack: ["Next.js", "React", "TypeScript", "MUI", "next-intl", "Zustand"],
    links: [
      { kind: "repo", url: "https://github.com/aws-ug-manizales/Skorify_Frontend" },
      { kind: "read", url: "https://github.com/aws-ug-manizales/Skorify_Frontend/pull/44" },
      { kind: "read", url: "https://github.com/aws-ug-manizales/Skorify_Frontend/pull/63" },
    ],
    hue: ["#3a2d1c", "#f0b27a"],
    color: "#f59e3a",
    category: "full-stack",
    role: { en: "Contributor, front end", es: "Contribuidor, front end" },
    period: "Apr – May 2026",
    metric: { en: "2 merged PRs (#44, #63)", es: "2 PRs integrados (#44, #63)" },
    featured: false,
  },
  {
    slug: "fitness-tracker",
    chapter: "VIII",
    name: "Fitness_Tracker",
    tagline: {
      en: "A workout tracker with a Go API",
      es: "Un registro de entrenamientos con una API en Go",
    },
    status: { en: "University project", es: "Proyecto universitario" },
    context: {
      en: "A university project from my Information Systems studies at Universidad de Caldas.",
      es: "Un proyecto universitario de mis estudios de Sistemas de Información en la Universidad de Caldas.",
    },
    summary: {
      en: "A small full-stack app to track exercise routines: a Go REST API with PostgreSQL and a React front end. It is a university project (Universidad de Caldas) to explore how a Go back end, a React front end and PostgreSQL fit together.",
      es: "Una pequeña aplicación full-stack para registrar rutinas de ejercicio: una API REST en Go con PostgreSQL y un front end en React. Es un proyecto universitario (Universidad de Caldas) para explorar cómo encajan un back end en Go, un front end en React y PostgreSQL.",
    },
    built: {
      en: "The Go back end has controllers for users, workouts, exercises and workout-session exercises, models, a PostgreSQL schema script, JWT utilities with an authentication middleware, and a CORS middleware so the React front end can call it from another origin. Users can register and log in, and create, read, update and delete routines. The README is in English and Spanish.",
      es: "El back end en Go tiene controladores para usuarios, entrenamientos, ejercicios y ejercicios de cada sesión, modelos, un script de esquema de PostgreSQL, utilidades de JWT con un middleware de autenticación y un middleware de CORS para que el front end en React pueda llamarlo desde otro origen. Las personas pueden registrarse, iniciar sesión y crear, leer, actualizar y borrar rutinas. El README está en inglés y en español.",
    },
    learned: {
      en: "This project is where I practised structuring a Go API with controllers, models and middleware, and compared it with the Python (FastAPI) and JavaScript back ends I already know.",
      es: "En este proyecto practiqué cómo estructurar una API en Go con controladores, modelos y middlewares, y la comparé con los back ends en Python (FastAPI) y JavaScript que ya conozco.",
    },
    stack: ["Go", "React", "PostgreSQL", "JWT", "REST API"],
    links: [{ kind: "repo", url: "https://github.com/Davidxap/Fitness_Tracker" }],
    hue: ["#1d3a3f", "#7fd4e0"],
    color: "#2fb8cf",
    category: "learning",
    role: { en: "Solo, university project", es: "Solo, proyecto universitario" },
    period: "2025",
    metric: { en: "Go API with JWT auth", es: "API en Go con auth JWT" },
    featured: false,
  },
  {
    slug: "linux-win-setup",
    chapter: "IX",
    name: "linux-win-setup",
    tagline: {
      en: "One command to set up a fresh Linux or Windows machine",
      es: "Un comando para configurar un equipo nuevo con Linux o Windows",
    },
    status: { en: "Open source · MIT", es: "Open source · MIT" },
    summary: {
      en: "An open-source setup script for a freshly installed machine: it asks what you want, installs the terminal, browsers, apps, gaming tuning, Docker and dev tools consistently, and can undo everything with one revert. It targets Fedora, Debian/Ubuntu and Arch, plus Windows 11 (winget) and WSL.",
      es: "Un script de configuración open source para un equipo recién instalado: pregunta qué quieres, instala de forma consistente la terminal, los navegadores, las aplicaciones, el ajuste para juegos, Docker y las herramientas de desarrollo, y puede deshacer todo con un solo revert. Funciona en Fedora, Debian/Ubuntu y Arch, además de Windows 11 (winget) y WSL.",
    },
    built: {
      en: "A Bash setup that shares one codebase across the Linux families with per-family package manifests, a separate PowerShell equivalent for Windows 11, and a WSL path. Multi-select browsers, one terminal and one file manager so nothing is duplicated, Flatpak apps, GameMode and AMD tuning for PC gaming, and Docker as either the native engine or Docker Desktop. The README is explicit about what is verified: tested on Fedora 44 (GNOME and KDE Plasma) and Debian 12 (GNOME); the Windows 11 run-through is planned and not yet verified.",
      es: "Un setup en Bash que comparte un solo código entre las familias de Linux con manifiestos de paquetes por familia, un equivalente separado en PowerShell para Windows 11 y una ruta para WSL. Navegadores con selección múltiple, una sola terminal y un solo gestor de archivos para no duplicar nada, aplicaciones con Flatpak, GameMode y ajuste para AMD en juegos de PC, y Docker como motor nativo o como Docker Desktop. El README es explícito sobre lo verificado: probado en Fedora 44 (GNOME y KDE Plasma) y Debian 12 (GNOME); la prueba en Windows 11 está planificada y aún no verificada.",
    },
    learned: {
      en: "Automating a task I repeat after every reinstall made me design for reversibility and be honest in the README about what has and has not been tested on each platform.",
      es: "Automatizar algo que repito después de cada reinstalación me llevó a diseñarlo para que sea reversible y a ser honesto en el README sobre lo que se ha probado y lo que no en cada plataforma.",
    },
    stack: ["Bash", "PowerShell", "Linux", "Docker", "Flatpak", "WSL"],
    links: [{ kind: "repo", url: "https://github.com/Davidxap/linux-win-setup" }],
    hue: ["#2d3a24", "#b6d97a"],
    color: "#8bc34a",
    category: "tools",
    role: { en: "Solo, scripts and docs", es: "Solo, scripts y documentación" },
    period: "Aug 2026",
    metric: { en: "Tested on Fedora 44 and Debian 12", es: "Probado en Fedora 44 y Debian 12" },
    featured: false,
  },
  {
    slug: "weather-app",
    chapter: "X",
    name: "weather-app-react",
    tagline: {
      en: "A small weather app for any city",
      es: "Una pequeña app del clima para cualquier ciudad",
    },
    status: { en: "University project · live demo offline", es: "Proyecto universitario · demo en línea apagada" },
    context: {
      en: "A university project from my Information Systems studies at Universidad de Caldas.",
      es: "Un proyecto universitario de mis estudios de Sistemas de Información en la Universidad de Caldas.",
    },
    summary: {
      en: "A small React app that shows the current weather and a forecast for a city, using the OpenWeatherMap API. I built it at university to practise calling an external API from React. Its Vercel deployment no longer exists, so the repository is all that remains.",
      es: "Una pequeña app en React que muestra el clima actual y un pronóstico de una ciudad con la API de OpenWeatherMap. La hice en la universidad para practicar el consumo de una API externa desde React. Su despliegue en Vercel ya no existe, así que solo queda el repositorio.",
    },
    built: {
      en: "Search by city name or use the browser's geolocation, switch between metric and imperial units, and jump to Manizales, New York, Tokyo, Paris or Madrid with one click. A service module fetches the current weather and the forecast and formats times with Luxon; pages are routed with React Router. Styled with Tailwind CSS on Vite.",
      es: "Búsqueda por nombre de ciudad o con la geolocalización del navegador, cambio entre unidades métricas e imperiales y acceso con un clic a Manizales, Nueva York, Tokio, París o Madrid. Un módulo de servicio obtiene el clima actual y el pronóstico y da formato a las horas con Luxon; las páginas se enrutan con React Router. Con estilos de Tailwind CSS sobre Vite.",
    },
    learned: {
      en: "Handling an external API's data shape, formatting times by timezone and keeping the fetching code apart from the components.",
      es: "Manejar la forma de los datos de una API externa, dar formato a las horas según la zona horaria y separar el código que pide los datos de los componentes.",
    },
    stack: ["React", "Vite", "Tailwind CSS", "React Router", "OpenWeatherMap API"],
    links: [{ kind: "repo", url: "https://github.com/Davidxap/weather-app-react" }],
    hue: ["#1d2f3f", "#8cc4ee"],
    color: "#4aa3df",
    category: "learning",
    role: { en: "Solo, university project", es: "Solo, proyecto universitario" },
    period: "Nov – Dec 2024",
    metric: { en: "Current weather and forecast", es: "Clima actual y pronóstico" },
    featured: false,
  },
  {
    slug: "ghibli-explorer",
    chapter: "XI",
    name: "studio-ghilbli-api",
    tagline: {
      en: "A Studio Ghibli film explorer",
      es: "Un explorador de películas de Studio Ghibli",
    },
    status: { en: "University project · live demo offline", es: "Proyecto universitario · demo en línea apagada" },
    context: {
      en: "A university project from my Information Systems studies at Universidad de Caldas.",
      es: "Un proyecto universitario de mis estudios de Sistemas de Información en la Universidad de Caldas.",
    },
    summary: {
      en: "A small React app that lists Studio Ghibli films from a public Ghibli API and opens a detail page for each one. I built it at university to practise routing and data fetching. Its Vercel deployment no longer exists, so the repository is all that remains.",
      es: "Una pequeña app en React que lista las películas de Studio Ghibli desde una API pública de Ghibli y abre una página de detalle de cada una. La hice en la universidad para practicar enrutamiento y consumo de datos. Su despliegue en Vercel ya no existe, así que solo queda el repositorio.",
    },
    built: {
      en: "A film grid with posters and titles, and a detail page per film that also loads its people, species, locations and vehicles from the same API. Loading and error states, routing with React Router, and Bootstrap for the layout, on Vite.",
      es: "Una cuadrícula de películas con póster y título, y una página de detalle por película que además carga sus personajes, especies, lugares y vehículos desde la misma API. Estados de carga y de error, enrutamiento con React Router y Bootstrap para el diseño, sobre Vite.",
    },
    learned: {
      en: "Fetching several related resources for one page, handling loading and error states, and structuring a small multi-page React app.",
      es: "Pedir varios recursos relacionados para una sola página, manejar estados de carga y de error y estructurar una pequeña app de React con varias páginas.",
    },
    stack: ["React", "Vite", "Bootstrap", "React Router", "Studio Ghibli API"],
    links: [{ kind: "repo", url: "https://github.com/Davidxap/studio-ghilbli-api" }],
    hue: ["#243a2c", "#9fd9a6"],
    color: "#5fbf78",
    category: "learning",
    role: { en: "Solo, university project", es: "Solo, proyecto universitario" },
    period: "Nov 2024",
    metric: { en: "Films with people, species and places", es: "Películas con personajes, especies y lugares" },
    featured: false,
  },
];
