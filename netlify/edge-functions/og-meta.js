export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const injectHeadTags = (html, tags) => html
    .replace(/<meta\s+name="description"\s+content="[^"]*">\s*/gi, "")
    .replace(/<link\s+rel="canonical"\s+href="[^"]*">\s*/gi, "")
    .replace(/<meta\s+property="og:title"\s+content="[^"]*">\s*/gi, "")
    .replace(/<meta\s+property="og:description"\s+content="[^"]*">\s*/gi, "")
    .replace(/<meta\s+property="og:image"\s+content="[^"]*">\s*/gi, "")
    .replace(/<meta\s+property="og:url"\s+content="[^"]*">\s*/gi, "")
    .replace(/<meta\s+property="og:type"\s+content="[^"]*">\s*/gi, "")
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*">\s*/gi, "")
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*">\s*/gi, "")
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*">\s*/gi, "")
    .replace(/<title>[^<]*<\/title>/i, tags);
  
  // Extraer el slug del post
  const cleanPath = path.toLowerCase().replace(/^\/+|\/+$/g, '');
  const parts = cleanPath.split('/');
  const slug = parts[parts.length - 1];
  const isBlogIndex = slug === 'blog' || slug === 'blogs';
  
  if (!slug) {
    return context.next();
  }
  
  try {
    if (isBlogIndex) {
      const response = await context.next();
      let html = await response.text();
      const blogUrl = "https://deliriumestudio.com/blog";
      const blogTitle = "Blog de Música Nacional | Delirium Estudio Costa Rica";
      const blogDescription = "Blog de música nacional de Delirium Estudio: producción musical, grabación, composición, artistas y escena musical de Costa Rica.";
      const imageUrl = "https://deliriumestudio.com/images/490346567_1242544121207056_3612573338702904588_n.jpg";
      const blogTags = `
    <title>${blogTitle}</title>
    <meta name="description" content="${blogDescription}">
    <link rel="canonical" href="${blogUrl}">
    <meta property="og:title" content="${blogTitle}">
    <meta property="og:description" content="${blogDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${blogUrl}">
    <meta property="og:type" content="website">
    <meta name="twitter:title" content="${blogTitle}">
    <meta name="twitter:description" content="${blogDescription}">
    <meta name="twitter:image" content="${imageUrl}">
    `;
      html = injectHeadTags(html, blogTags);

      return new Response(html, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      });
    }

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
    
    html = injectHeadTags(html, ogTags);
    
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
  path: ["/blog", "/blogs", "/blog/*", "/blogs/*", "/Blog", "/Blogs", "/Blog/*", "/Blogs/*"]
};
