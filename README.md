# Haunted Tips

Tienda de uñas Halloween de `turjemanmlevi-commits`. Next.js App Router, React, TypeScript y Shopify Storefront API. Diseño propio en burdeos, negro y crema, tipografía Cormorant Garamond + Manrope, animaciones con soporte de movimiento reducido.

Preview público: [Haunted Tips](https://tienda-shopify-eta.vercel.app/). Proyecto conectado a GitHub en el equipo de Vercel `turjemanmlevi-commits-projects`, proyecto `tienda-shopify`. GitHub confirmó el primer despliegue de producción correcto el 10 de septiembre de 2026. Los cambios enviados a `main` activan el despliegue de Vercel.

## Verla en este dispositivo

Necesitas Node.js 22.18 o posterior (las pruebas usan soporte nativo de TypeScript).

```powershell
npm ci
npm run dev
```

Abre http://127.0.0.1:3000. La web funciona sin credenciales con las 25 fichas de demostración de `data/products.json`. Sus precios son propuestas, el stock no está confirmado y no permite pedidos.

Incluye portada, catálogo, búsqueda, filtros por estilo y forma, ordenación, fichas individuales, sugerencias, carrito, historia, guía, preguntas frecuentes, contacto y páginas provisionales de envíos, privacidad y términos.

## Editar desde Codex y GitHub

Este directorio es la raíz del repositorio https://github.com/turjemanmlevi-commits/TiendaShopify. Abre esta carpeta como proyecto de Codex. Los cambios de diseño se realizan aquí; los pedidos y el inventario real se gestionarán en Shopify.

- `app/page.tsx` y `app/globals.css`: portada y diseño general.
- `components/`: navegación, catálogo, galería y carrito.
- `app/products/[handle]/`: ficha de producto.
- `data/products.json`: catálogo de preview, sin costes privados de proveedores.
- `public/images/`: fotografías de la web.
- `lib/shopify.ts`: catálogo, inventario y operaciones de carrito en Shopify.

Antes de subir un cambio:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
git add .
git commit -m "Describe el cambio"
git push
```

No subas `.env.local`, credenciales, informes privados de costes ni datos de clientes. Git ignora los archivos locales de entorno.

## Conectar Shopify

1. Configura y habilita la tienda en Shopify y el canal que dará acceso al escaparate personalizado.
2. Obtén un token **Storefront público** para ese canal con permisos de catálogo, inventario y carrito. Un token Admin no sirve aquí.
3. Copia `.env.example` a `.env.local` y completa `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. En Vercel, introduce estos valores en las variables de entorno del proyecto, nunca en GitHub.
4. Publica los productos en el canal correspondiente. Usa la etiqueta `halloween`, `haunted-tips` o `the-halloween-edit`. El catálogo se limita a Halloween y precios USD.
5. Mantén el inventario seguido y la venta sin stock desactivada. El código solo considera disponible una variante con `availableForSale` y `quantityAvailable` mayor que cero.
6. Verifica stock y envíos con el proveedor; completa políticas, identidad legal, devoluciones, pagos y promociones reales. Haz un pedido de prueba en Shopify.
7. Solo entonces establece `STOREFRONT_LAUNCH_READY=true` y el dominio real en `NEXT_PUBLIC_SITE_URL`.

Con un token configurado, el catálogo procede de Shopify. Si Shopify falla, la web muestra el error; no lo sustituye por inventario simulado. Sin token se usa el catálogo de preview. La bandera de lanzamiento controla el acceso al carrito y la indexación; no confirma por sí sola que tu negocio esté preparado.

El código no sincroniza inventario del proveedor. Esa conexión necesita una integración de cumplimiento y disponibilidad verificada. No se han incorporado reseñas inventadas ni descuentos tachados ficticios.

## Conectar Vercel

El proyecto ya está importado. No hace falta crear otro ni contratar otro plan. El propietario ha confirmado que contrató Pro; la CLI de este dispositivo sigue autenticada en un equipo distinto. Para gestionar variables, usa el [panel del proyecto correcto](https://vercel.com/turjemanmlevi-commits-projects/tienda-shopify/settings/environment-variables).

1. Entra en Vercel con acceso al equipo `turjemanmlevi-commits-projects`.
2. Mantén conectado `turjemanmlevi-commits/TiendaShopify`. Framework: **Next.js**. Root Directory: **raíz del repositorio** (no `tienda-shopify`, porque esa ya es la carpeta clonada).
3. Para la primera revisión, deja el token sin configurar y `STOREFRONT_LAUNCH_READY=false`.
4. Revisa la URL de despliegue. La integración de GitHub puede crear previews de ramas y desplegar los cambios de la rama de producción.
5. Al configurar Shopify, usa `https://tienda-shopify-eta.vercel.app` en `NEXT_PUBLIC_SITE_URL`. La URL pública también es el valor por defecto del código, para que las imágenes al compartir un enlace no apunten a localhost.

Fuentes: [GitHub con Vercel](https://vercel.com/docs/git/vercel-for-github), [Hobby](https://vercel.com/docs/plans/hobby), [Pro](https://vercel.com/docs/plans/pro-plan), [Shopify con tu propio frontend](https://shopify.dev/docs/storefronts/headless/bring-your-own-stack).

## Estado de entrega

Implementación y preview desplegado; no equivale a una tienda comercial lanzada. El acceso Storefront y el checkout real deben verificarse con Shopify habilitado. Las páginas de términos y privacidad son avisos provisionales de preview, no políticas comerciales definitivas. Las presentaciones regeneradas de producto necesitan conservar fielmente el diseño del proveedor y validarse antes de vender; las fichas pendientes usan una imagen de espera.
