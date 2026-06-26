export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  
  // Extraer el slug del post
  const cleanPath = path.toLowerCase().replace(/^\/+|\/+$/g, '');
  const parts = cleanPath.split('/');
  const slug = parts[parts.length - 1];
  
  if (!slug || slug === 'blog' || slug === 'blogs') {
    return context.next();
  }
  
  try {
    // Consultar la API de WordPress.com por el slug específico
    const wpUrl = `https://public-api.wordpress.com/rest/v1.1/sites/delirium796.wordpress.com/posts/slug:${slug}`;
    const wpResponse = await fetch(wpUrl);
    if (!wpResponse.ok) {
      return context.next();
    }
    
    const post = await wpResponse.json();
    
    // Obtener el HTML base original (index.html)
    const response = await context.next();
    let html = await response.text();
    
    // Limpiar etiquetas HTML de la descripción
    let excerpt = post.excerpt || "";
    excerpt = excerpt.replace(/<\/?[^>]+(>|$)/g, "").trim(); 
    if (excerpt.length > 150) {
      excerpt = excerpt.substring(0, 150) + "...";
    }
    
    const title = escapeHtml(post.title);
    const imageUrl = escapeHtml(post.featured_image || "https://deliriumestudio.com/images/490346567_1242544121207056_3612573338702904588_n.jpg");
    const postUrl = `https://deliriumestudio.com/blogs/${slug}`;
    const canonicalUrl = escapeHtml(postUrl);
    const safeExcerpt = escapeHtml(excerpt);
    const publishedDate = escapeHtml(post.date || "");
    
    // Bloque de etiquetas Meta para Redes Sociales (Facebook, WhatsApp, Twitter)
    const ogTags = `
    <title>${title} | Blog de Música Nacional - Delirium Estudio</title>
    <meta name="description" content="${safeExcerpt}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${safeExcerpt}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="article">
    <meta property="article:published_time" content="${publishedDate}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${safeExcerpt}">
    <meta name="twitter:image" content="${imageUrl}">
    `;
    
    html = html.replace(/<link rel="canonical" href="[^"]*">/i, "");
    // Reemplazar la etiqueta title por el bloque completo de etiquetas dinámicas
    html = html.replace(/<title>[^<]*<\/title>/i, ogTags);
    
    return new Response(html, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (err) {
    console.error("Error en la Edge Function de Netlify:", err);
    return context.next();
  }
};

export const config = {
  path: ["/blog/*", "/blogs/*", "/Blog/*", "/Blogs/*"]
};
