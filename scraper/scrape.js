import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const BASE_URL = 'https://pablomoche.cl';

// Todos los artículos mapeados del sitio
const ARTICLES = [
  // MÉDICO - Alimentación
  { url: '/alimentacion/7-cientificos-alemanes-recomiendan-no-cocinar-alimentos-con-utensilios-de-plastico-a-mas-de-70-celsius', category: 'medico', subcategory: 'alimentacion' },
  { url: '/alimentacion/6-incluidos-los-jugos-de-fruta-100-asocian-el-consumo-de-bebidas-azucaradas-con-mayor-riesgo-de-cancer', category: 'medico', subcategory: 'alimentacion' },
  { url: '/alimentacion/5-consumir-bebidas-azucaradas-a-diario-aumenta-el-riesgo-de-muerte-prematura', category: 'medico', subcategory: 'alimentacion' },
  { url: '/alimentacion/4-un-nuevo-estudio-relaciono-el-consumo-de-refresco-con-muerte-temprana', category: 'medico', subcategory: 'alimentacion' },
  { url: '/alimentacion/3-comer-papas-fritas-duplica-las-posibilidades-de-muerte-prematura', category: 'medico', subcategory: 'alimentacion' },
  { url: '/alimentacion/2-las-bebidas-light-podrian-arruinarte-la-vida-infobae', category: 'medico', subcategory: 'alimentacion' },
  { url: '/alimentacion/1-otro-escandalo-revelan-sobornos-de-la-industria-del-azucar-a-investigadores-de-harvard', category: 'medico', subcategory: 'alimentacion' },

  // MÉDICO - Sobre medicamentos
  { url: '/sobre-medicamentos/15-estudio-revela-inesperados-efectos-psicologicos-del-paracetamol-reduce-la-empatia-y-el-placer-personal', category: 'medico', subcategory: 'medicamentos' },
  { url: '/sobre-medicamentos/14-estudio-europeo-advirtio-que-los-anticonceptivos-podrian-provocar-depresion-e-incluso-tendencias-suicidas', category: 'medico', subcategory: 'medicamentos' },
  { url: '/sobre-medicamentos/13-estudio-concluye-que-los-antiacidos-pueden-provocar-la-muerte-prematura', category: 'medico', subcategory: 'medicamentos' },

  // MÉDICO - Enfermedades
  { url: '/enfermedades/12-los-chicos-que-se-acuestan-tarde-tiene-mas-riesgo-de-sufrir-obesidad', category: 'medico', subcategory: 'enfermedades' },
  { url: '/enfermedades/11-mega-estudio-nueva-evidencia-de-que-dormir-mal-afectaria-la-salud-del-corazon', category: 'medico', subcategory: 'enfermedades' },
  { url: '/enfermedades/10-el-amor-puede-romper-literalmente-el-corazon', category: 'medico', subcategory: 'enfermedades' },

  // MÉDICO - Tecnología y sus efectos
  { url: '/tecnologia-y-sus-efectos/23-usar-una-tableta-afecta-la-inteligencia-de-tus-hijos', category: 'medico', subcategory: 'tecnologia' },
  { url: '/tecnologia-y-sus-efectos/22-para-que-el-nino-sea-listo-mejor-un-instrumento-musical-que-la-tablet', category: 'medico', subcategory: 'tecnologia' },
  { url: '/tecnologia-y-sus-efectos/21-estudio-relaciona-el-uso-de-pantallas-con-lento-desarrollo-en-ninos', category: 'medico', subcategory: 'tecnologia' },
  { url: '/tecnologia-y-sus-efectos/20-advierten-de-los-riesgos-del-uso-de-dispositivos-electronicos-en-preescolares', category: 'medico', subcategory: 'tecnologia' },
  { url: '/tecnologia-y-sus-efectos/19-el-lado-b-de-la-tecnologia-el-ojo-seco-un-mal-de-epoca-por-las-pantallas-ahora-lo-sufren-hasta-los-chicos', category: 'medico', subcategory: 'tecnologia' },
  { url: '/tecnologia-y-sus-efectos/18-excessive-screen-time-linked-to-preschool-learning-delays', category: 'medico', subcategory: 'tecnologia' },
  { url: '/tecnologia-y-sus-efectos/17-la-vieja-receta-que-los-pediatras-tuvieron-que-recordarle-a-los-padres-en-la-era-de-la-tecnologia', category: 'medico', subcategory: 'tecnologia' },
  { url: '/tecnologia-y-sus-efectos/16-drenaje-cerebral-el-peligroso-efecto-que-produce-tener-un-smartphone-siempre-al-alcance', category: 'medico', subcategory: 'tecnologia' },

  // MÉDICO - Otros
  { url: '/otros/9-la-receta-mas-simple-aseguran-que-para-mejorar-la-salud-se-deben-pasar-dos-horas-por-semana-en-la-naturaleza', category: 'medico', subcategory: 'otros' },

  // ESPIRITUAL - Karma, Destino y Biografía
  { url: '/karma-destino-y-biografia/41-20-anos-despues-se-reencuentran', category: 'espiritual', subcategory: 'karma-destino' },
  { url: '/karma-destino-y-biografia/40-refugiada', category: 'espiritual', subcategory: 'karma-destino' },
  { url: '/karma-destino-y-biografia/36-amigos-hermanos', category: 'espiritual', subcategory: 'karma-destino' },
  { url: '/karma-destino-y-biografia/37-en-busca-del-padre', category: 'espiritual', subcategory: 'karma-destino' },
  { url: '/karma-destino-y-biografia/38-lluvia-de-papelitos', category: 'espiritual', subcategory: 'karma-destino' },
  { url: '/karma-destino-y-biografia/39-presagio', category: 'espiritual', subcategory: 'karma-destino' },

  // ESPIRITUAL - Reencarnación
  { url: '/reencarnacion/45-reencarnacion-ii', category: 'espiritual', subcategory: 'reencarnacion' },
  { url: '/reencarnacion/46-reencarnacion', category: 'espiritual', subcategory: 'reencarnacion' },

  // ESPIRITUAL - Muerte
  { url: '/muerte/33-rajiv-parti', category: 'espiritual', subcategory: 'muerte' },
  { url: '/muerte/34-elizabeth-kubler-ross', category: 'espiritual', subcategory: 'muerte' },
  { url: '/muerte/32-anita-moorjarin', category: 'espiritual', subcategory: 'muerte' },
  { url: '/muerte/35-relato-doctor-harvard', category: 'espiritual', subcategory: 'muerte' },

  // ESPIRITUAL - Otras
  { url: '/otras/42-ciencia-y-dios', category: 'espiritual', subcategory: 'otras' },
  { url: '/otras/44-pensamiento-curacion', category: 'espiritual', subcategory: 'otras' },
  { url: '/otras/43-la-voz-de-la-madre', category: 'espiritual', subcategory: 'otras' },

  // EVOLUTIVO
  { url: '/evolutivo/29-nueva-evidencia-sugiere-que-la-luna-si-fue-formada-despues-de-un-impacto-gigante', category: 'evolutivo', subcategory: null },
  { url: '/evolutivo/28-una-nueva-teoria-explica-como-se-habria-formado-la-luna', category: 'evolutivo', subcategory: null },
  { url: '/evolutivo/27-en-el-mundo-de-las-bacterias-no-sobrevive-el-mas-fuerte-sino-el-mas-cooperativo', category: 'evolutivo', subcategory: null },

  // PEDAGÓGICO - Pedagogía
  { url: '/pedagogia/24-the-new-york-times-la-mejor-manera-de-aprender-es-con-carino', category: 'pedagogico', subcategory: 'pedagogia' },

  // PEDAGÓGICO - Medios tecnológicos
  { url: '/medios-tecnologicos/47-usar-una-tableta-afecta-la-inteligencia-de-tus-hijos', category: 'pedagogico', subcategory: 'medios-tecnologicos' },
  { url: '/medios-tecnologicos/48-para-que-el-nino-sea-listo-mejor-un-instrumento-musical-que-la-tablet', category: 'pedagogico', subcategory: 'medios-tecnologicos' },
  { url: '/medios-tecnologicos/49-estudio-relaciona-el-uso-de-pantallas-con-lento-desarrollo-en-ninos', category: 'pedagogico', subcategory: 'medios-tecnologicos' },
  { url: '/medios-tecnologicos/50-advierten-de-los-riesgos-del-uso-de-dispositivos-electronicos-en-preescolares', category: 'pedagogico', subcategory: 'medios-tecnologicos' },
  { url: '/medios-tecnologicos/51-el-lado-b-de-la-tecnologia-el-ojo-seco-un-mal-de-epoca-por-las-pantallas-ahora-lo-sufren-hasta-los-chicos', category: 'pedagogico', subcategory: 'medios-tecnologicos' },
  { url: '/medios-tecnologicos/52-excessive-screen-time-linked-to-preschool-learning-delays', category: 'pedagogico', subcategory: 'medios-tecnologicos' },
  { url: '/medios-tecnologicos/53-la-vieja-receta-que-los-pediatras-tuvieron-que-recordarle-a-los-padres-en-la-era-de-la-tecnologia', category: 'pedagogico', subcategory: 'medios-tecnologicos' },
  { url: '/medios-tecnologicos/54-drenaje-cerebral-el-peligroso-efecto-que-produce-tener-un-smartphone-siempre-al-alcance', category: 'pedagogico', subcategory: 'medios-tecnologicos' },

  // SOCIAL CULTURAL ECONÓMICO
  { url: '/social-cultural-economico/25-quien-es-dan-price-el-ceo-que-regala-su-sueldo-a-sus-empleados', category: 'social', subcategory: null },

  // DEL HUMOR
  { url: '/del-humor/31-manual-para-ser-feliz', category: 'humor', subcategory: null },
  { url: '/del-humor/30-cuentos-sin-utero', category: 'humor', subcategory: null },

  // DE INTERÉS GENERAL
  { url: '/de-interes-general/26-ninos-solares-el-misterio-que-desvela-a-los-medicos', category: 'general', subcategory: null },
];

// Delay para no sobrecargar el servidor
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para limpiar HTML y convertir a texto
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\t+/g, ' ')           // Limpiar tabs
    .replace(/ {2,}/g, ' ')         // Múltiples espacios a uno
    .replace(/\n{3,}/g, '\n\n')     // Múltiples saltos a máximo 2
    .replace(/^\s+|\s+$/gm, '')     // Trim cada línea
    .trim();
}

// Función para generar slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

// Función principal de scraping
async function scrapeArticle(articleInfo) {
  const fullUrl = `${BASE_URL}${articleInfo.url}`;
  console.log(`📥 Scraping: ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`❌ Error ${response.status}: ${fullUrl}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extraer título - buscar en varios lugares
    let title = $('h1').first().text().trim() ||
                $('h2.item-title').text().trim() ||
                $('.page-header h1').text().trim() ||
                $('title').text().split('|')[0].trim();

    // Extraer contenido principal
    // Joomla típicamente usa estas clases
    let content = '';
    const contentSelectors = [
      '.item-page',
      '.com-content-article',
      'article',
      '.item-content',
      '#content',
      '.content',
      'main'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length) {
        // Remover elementos no deseados
        element.find('script, style, nav, header, footer, .pagination, .breadcrumb').remove();
        content = element.html();
        if (content && content.length > 100) break;
      }
    }

    // Si no encontramos contenido con selectores, intentar con body
    if (!content || content.length < 100) {
      $('body').find('script, style, nav, header, footer, .pagination, .breadcrumb, .navbar').remove();
      content = $('body').html();
    }

    const cleanContent = cleanHtml(content);

    // Extraer fecha
    let publishDate = null;
    const dateSelectors = [
      'time[datetime]',
      '.published',
      '.created',
      '.date',
      'meta[property="article:published_time"]'
    ];

    for (const selector of dateSelectors) {
      const el = $(selector);
      if (el.length) {
        publishDate = el.attr('datetime') || el.attr('content') || el.text().trim();
        if (publishDate) break;
      }
    }

    // Extraer autor
    let author = null;
    const authorSelectors = [
      '.createdby',
      '.author',
      'meta[name="author"]',
      '[rel="author"]'
    ];

    for (const selector of authorSelectors) {
      const el = $(selector);
      if (el.length) {
        author = el.attr('content') || el.text().trim();
        if (author) break;
      }
    }

    // Extraer imagen destacada
    let featuredImage = null;
    const imgSelectors = [
      'meta[property="og:image"]',
      '.item-image img',
      'article img',
      '.content img'
    ];

    for (const selector of imgSelectors) {
      const el = $(selector).first();
      if (el.length) {
        featuredImage = el.attr('content') || el.attr('src');
        if (featuredImage) {
          if (!featuredImage.startsWith('http')) {
            featuredImage = `${BASE_URL}${featuredImage}`;
          }
          break;
        }
      }
    }

    // Extraer descripción/excerpt
    let excerpt = $('meta[name="description"]').attr('content') ||
                  $('meta[property="og:description"]').attr('content') ||
                  cleanContent.substring(0, 300) + '...';

    return {
      id: articleInfo.url.match(/\/(\d+)-/)?.[1] || null,
      title,
      slug: generateSlug(title),
      content: cleanContent,
      excerpt,
      category: articleInfo.category,
      subcategory: articleInfo.subcategory,
      author,
      publishDate,
      featuredImage,
      sourceUrl: fullUrl,
      scrapedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error scraping ${fullUrl}:`, error.message);
    return null;
  }
}

// Función para guardar como Markdown
function saveAsMarkdown(article, outputDir) {
  const filename = `${article.slug}.md`;
  const filepath = `${outputDir}/${filename}`;

  const frontmatter = `---
title: "${article.title.replace(/"/g, '\\"')}"
slug: "${article.slug}"
category: "${article.category}"
${article.subcategory ? `subcategory: "${article.subcategory}"` : ''}
${article.author ? `author: "${article.author}"` : ''}
${article.publishDate ? `date: "${article.publishDate}"` : ''}
${article.featuredImage ? `image: "${article.featuredImage}"` : ''}
sourceUrl: "${article.sourceUrl}"
---

${article.content}
`;

  writeFileSync(filepath, frontmatter);
  return filepath;
}

// Main
async function main() {
  console.log('🚀 Iniciando scraping de pablomoche.cl');
  console.log(`📊 Total de artículos a procesar: ${ARTICLES.length}\n`);

  // Crear directorios de salida
  const outputDir = './output';
  const markdownDir = `${outputDir}/markdown`;

  if (!existsSync(outputDir)) mkdirSync(outputDir);
  if (!existsSync(markdownDir)) mkdirSync(markdownDir);

  const results = [];
  const errors = [];

  // Modo test: solo procesar 3 artículos
  const isTest = process.argv.includes('--test');
  const articlesToProcess = isTest ? ARTICLES.slice(0, 3) : ARTICLES;

  if (isTest) {
    console.log('🧪 MODO TEST: Procesando solo 3 artículos\n');
  }

  for (let i = 0; i < articlesToProcess.length; i++) {
    const articleInfo = articlesToProcess[i];

    const article = await scrapeArticle(articleInfo);

    if (article) {
      results.push(article);
      saveAsMarkdown(article, markdownDir);
      console.log(`✅ [${i + 1}/${articlesToProcess.length}] ${article.title.substring(0, 50)}...`);
    } else {
      errors.push(articleInfo.url);
    }

    // Delay entre requests
    await delay(500);
  }

  // Guardar JSON completo
  writeFileSync(
    `${outputDir}/articles.json`,
    JSON.stringify(results, null, 2)
  );

  // Guardar resumen
  const summary = {
    totalArticles: ARTICLES.length,
    processed: results.length,
    errors: errors.length,
    errorUrls: errors,
    categories: [...new Set(results.map(r => r.category))],
    scrapedAt: new Date().toISOString()
  };

  writeFileSync(
    `${outputDir}/summary.json`,
    JSON.stringify(summary, null, 2)
  );

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`✅ Artículos procesados: ${results.length}`);
  console.log(`❌ Errores: ${errors.length}`);
  console.log(`📁 Output: ${outputDir}/`);
  console.log(`   - articles.json (datos completos)`);
  console.log(`   - markdown/ (archivos .md individuales)`);
  console.log(`   - summary.json (resumen)`);

  if (errors.length > 0) {
    console.log('\n⚠️  URLs con errores:');
    errors.forEach(url => console.log(`   - ${url}`));
  }
}

main().catch(console.error);
