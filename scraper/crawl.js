import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { URL } from 'url';
import { join } from 'path';

const BASE_URL = 'https://pablomoche.cl';
const OUTPUT_DIR = './output/crawl';
const DELAY_MS = 600;
const MAX_PAGES = 500;
const REQUEST_TIMEOUT = 15000;

// State
const visited = new Set();
const queue = [];
const pages = [];
const assets = { images: new Set(), css: new Set(), js: new Set(), fonts: new Set(), other: new Set() };
const brokenLinks = [];
const externalLinks = new Set();
const siteTree = {};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function isInternalUrl(urlStr) {
  try {
    const parsed = new URL(urlStr, BASE_URL);
    return parsed.hostname === new URL(BASE_URL).hostname;
  } catch {
    return false;
  }
}

function normalizeUrl(urlStr) {
  try {
    const parsed = new URL(urlStr, BASE_URL);
    // Remove hash, normalize trailing slash for non-root, remove common tracking params
    parsed.hash = '';
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    let path = parsed.pathname;
    // Normalize: remove trailing slash except for root
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return `${parsed.origin}${path}${parsed.search}`;
  } catch {
    return null;
  }
}

function classifyAsset(urlStr) {
  const lower = urlStr.toLowerCase();
  if (/\.(jpe?g|png|gif|svg|webp|ico|bmp|avif)(\?|$)/.test(lower)) return 'images';
  if (/\.css(\?|$)/.test(lower)) return 'css';
  if (/\.js(\?|$)/.test(lower)) return 'js';
  if (/\.(woff2?|ttf|eot|otf)(\?|$)/.test(lower)) return 'fonts';
  if (/\.(pdf|doc|docx|xls|xlsx|zip|mp3|mp4|wav)(\?|$)/.test(lower)) return 'other';
  return null;
}

function getPathSegments(urlStr) {
  try {
    const parsed = new URL(urlStr, BASE_URL);
    return parsed.pathname.split('/').filter(Boolean);
  } catch {
    return [];
  }
}

function addToSiteTree(urlStr, pageData) {
  const segments = getPathSegments(urlStr);
  let node = siteTree;
  for (const seg of segments) {
    if (!node[seg]) node[seg] = {};
    node = node[seg];
  }
  node._page = {
    url: urlStr,
    title: pageData.title,
    type: pageData.pageType,
  };
}

function detectPageType($, url) {
  const path = new URL(url, BASE_URL).pathname;

  // Home
  if (path === '/' || path === '') return 'home';

  // Joomla category/section pages
  if ($('.category-list, .blog, .items-leading, .items-row').length) return 'category';
  if ($('.item-page, .com-content-article').length) return 'article';

  // Check for lists of links (index pages)
  const mainLinks = $('main a, .content a, #content a, article a').length;
  if (mainLinks > 10 && !$('.item-page').length) return 'listing';

  // Contact/form pages
  if ($('form').length && $('input[type="email"], textarea').length) return 'contact';

  // Generic content
  if ($('article, .content, main').text().trim().length > 200) return 'content';

  return 'unknown';
}

function extractMetadata($, url) {
  return {
    title: $('title').text().trim(),
    h1: $('h1').first().text().trim(),
    metaDescription: $('meta[name="description"]').attr('content') || null,
    ogTitle: $('meta[property="og:title"]').attr('content') || null,
    ogDescription: $('meta[property="og:description"]').attr('content') || null,
    ogImage: $('meta[property="og:image"]').attr('content') || null,
    canonical: $('link[rel="canonical"]').attr('href') || null,
    language: $('html').attr('lang') || null,
    generator: $('meta[name="generator"]').attr('content') || null,
  };
}

function extractNavigation($) {
  const nav = [];
  $('nav a, .menu a, .navbar a, #menu a').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && text) {
      nav.push({ text, href });
    }
  });
  return nav;
}

function extractContentStructure($) {
  const headings = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    headings.push({
      level: parseInt(el.tagName.replace('h', '')),
      text: $(el).text().trim(),
    });
  });

  const images = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    const alt = $(el).attr('alt') || '';
    if (src) images.push({ src, alt });
  });

  const forms = [];
  $('form').each((_, el) => {
    forms.push({
      action: $(el).attr('action') || '',
      method: $(el).attr('method') || 'get',
      fields: [],
    });
    $(el)
      .find('input, textarea, select')
      .each((__, field) => {
        forms[forms.length - 1].fields.push({
          type: $(field).attr('type') || field.tagName.toLowerCase(),
          name: $(field).attr('name') || '',
        });
      });
  });

  return { headings, images, forms };
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

async function crawlPage(url) {
  if (visited.has(url) || visited.size >= MAX_PAGES) return;
  visited.add(url);

  const pageNum = visited.size;
  console.log(`[${pageNum}] Crawling: ${url}`);

  try {
    const response = await fetchPage(url);

    if (!response.ok) {
      console.log(`  -> ${response.status} ${response.statusText}`);
      brokenLinks.push({ url, status: response.status, statusText: response.statusText });
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      // It's an asset, classify and skip
      const assetType = classifyAsset(url);
      if (assetType) assets[assetType].add(url);
      return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Detect page type
    const pageType = detectPageType($, url);
    const metadata = extractMetadata($, url);
    const navigation = extractNavigation($);
    const structure = extractContentStructure($);

    // Extract raw HTML content for article pages
    let rawContent = null;
    if (pageType === 'article' || pageType === 'content') {
      const selectors = [
        '.item-page',
        '.com-content-article',
        'article',
        '.item-content',
        '#content .content',
        'main',
      ];
      for (const sel of selectors) {
        const el = $(sel);
        if (el.length && el.html().length > 100) {
          // Clone and clean
          const clone = el.clone();
          clone.find('script, style, nav, .pagination, .breadcrumb, .pager').remove();
          rawContent = clone.html();
          break;
        }
      }
    }

    const pageData = {
      url,
      status: response.status,
      pageType,
      metadata,
      navigation: navigation.length ? navigation : undefined,
      structure,
      rawContentLength: rawContent ? rawContent.length : 0,
      rawContent,
    };

    pages.push(pageData);
    addToSiteTree(url, pageData);

    // Find all links and assets on page
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

      try {
        const resolved = new URL(href, url).toString();
        const normalized = normalizeUrl(resolved);
        if (!normalized) return;

        if (isInternalUrl(normalized)) {
          const assetType = classifyAsset(normalized);
          if (assetType) {
            assets[assetType].add(normalized);
          } else if (!visited.has(normalized) && !queue.includes(normalized)) {
            queue.push(normalized);
          }
        } else {
          externalLinks.add(resolved);
        }
      } catch {
        // invalid URL, skip
      }
    });

    // Collect assets from src/href attributes
    $('img[src], source[src], video[src], audio[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          const resolved = new URL(src, url).toString();
          const type = classifyAsset(resolved) || 'images';
          assets[type].add(resolved);
        } catch {
          // skip
        }
      }
    });

    $('link[rel="stylesheet"][href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          assets.css.add(new URL(href, url).toString());
        } catch {
          // skip
        }
      }
    });

    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          assets.js.add(new URL(src, url).toString());
        } catch {
          // skip
        }
      }
    });

    console.log(`  -> ${pageType} | "${metadata.title?.substring(0, 50)}..." | ${queue.length} in queue`);
  } catch (error) {
    console.log(`  -> ERROR: ${error.message}`);
    brokenLinks.push({ url, status: 0, error: error.message });
  }
}

function buildArchitectureReport() {
  // Categorize pages
  const pagesByType = {};
  for (const page of pages) {
    if (!pagesByType[page.pageType]) pagesByType[page.pageType] = [];
    pagesByType[page.pageType].push(page);
  }

  // Build URL structure
  const urlPaths = pages.map((p) => {
    try {
      return new URL(p.url).pathname;
    } catch {
      return p.url;
    }
  }).sort();

  // Detect CMS/technology
  const generators = pages.map((p) => p.metadata?.generator).filter(Boolean);
  const uniqueGenerators = [...new Set(generators)];

  // Navigation structure from home page
  const homePage = pages.find((p) => p.pageType === 'home');
  const mainNav = homePage?.navigation || [];

  // Category structure
  const categories = new Map();
  for (const page of pages) {
    const segments = getPathSegments(page.url);
    if (segments.length >= 1) {
      const cat = segments[0];
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat).push({
        url: page.url,
        title: page.metadata?.title || page.metadata?.h1 || '',
        type: page.pageType,
      });
    }
  }

  return {
    summary: {
      totalPages: pages.length,
      totalAssets: {
        images: assets.images.size,
        css: assets.css.size,
        js: assets.js.size,
        fonts: assets.fonts.size,
        other: assets.other.size,
      },
      externalLinks: externalLinks.size,
      brokenLinks: brokenLinks.length,
      technologies: uniqueGenerators,
    },
    pagesByType,
    urlPaths,
    mainNavigation: mainNav,
    categories: Object.fromEntries(categories),
    siteTree,
    externalLinks: [...externalLinks].sort(),
    brokenLinks,
    assets: {
      images: [...assets.images].sort(),
      css: [...assets.css].sort(),
      js: [...assets.js].sort(),
      fonts: [...assets.fonts].sort(),
      other: [...assets.other].sort(),
    },
  };
}

function generateMarkdownReport(report) {
  let md = `# Arquitectura del Sitio - pablomoche.cl\n\n`;
  md += `> Crawl realizado: ${new Date().toISOString()}\n\n`;

  md += `## Resumen\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Paginas totales | ${report.summary.totalPages} |\n`;
  md += `| Imagenes | ${report.summary.totalAssets.images} |\n`;
  md += `| Archivos CSS | ${report.summary.totalAssets.css} |\n`;
  md += `| Archivos JS | ${report.summary.totalAssets.js} |\n`;
  md += `| Fonts | ${report.summary.totalAssets.fonts} |\n`;
  md += `| Enlaces externos | ${report.summary.externalLinks} |\n`;
  md += `| Enlaces rotos | ${report.summary.brokenLinks} |\n`;
  md += `| CMS/Generador | ${report.summary.technologies.join(', ') || 'No detectado'} |\n\n`;

  md += `## Navegacion Principal\n\n`;
  if (report.mainNavigation.length) {
    for (const item of report.mainNavigation) {
      md += `- [${item.text}](${item.href})\n`;
    }
  } else {
    md += `_No se detecto navegacion principal_\n`;
  }
  md += `\n`;

  md += `## Paginas por Tipo\n\n`;
  for (const [type, pagesOfType] of Object.entries(report.pagesByType)) {
    md += `### ${type} (${pagesOfType.length})\n\n`;
    for (const page of pagesOfType) {
      const title = page.metadata?.h1 || page.metadata?.title || page.url;
      md += `- **${title}**\n  ${page.url}\n`;
    }
    md += `\n`;
  }

  md += `## Estructura de URLs\n\n`;
  md += `\`\`\`\n`;
  for (const path of report.urlPaths) {
    md += `${path}\n`;
  }
  md += `\`\`\`\n\n`;

  md += `## Categorias y Contenido\n\n`;
  for (const [cat, catPages] of Object.entries(report.categories)) {
    md += `### /${cat}/ (${catPages.length} paginas)\n\n`;
    for (const page of catPages) {
      md += `- ${page.title || page.url} [${page.type}]\n`;
    }
    md += `\n`;
  }

  if (report.brokenLinks.length) {
    md += `## Enlaces Rotos\n\n`;
    for (const link of report.brokenLinks) {
      md += `- ${link.url} -> ${link.status} ${link.statusText || link.error || ''}\n`;
    }
    md += `\n`;
  }

  md += `## Assets\n\n`;
  md += `### Imagenes (${report.assets.images.length})\n\n`;
  for (const img of report.assets.images.slice(0, 50)) {
    md += `- ${img}\n`;
  }
  if (report.assets.images.length > 50) {
    md += `- ... y ${report.assets.images.length - 50} mas\n`;
  }
  md += `\n`;

  md += `### CSS (${report.assets.css.length})\n\n`;
  for (const css of report.assets.css) {
    md += `- ${css}\n`;
  }
  md += `\n`;

  md += `### JS (${report.assets.js.length})\n\n`;
  for (const js of report.assets.js) {
    md += `- ${js}\n`;
  }
  md += `\n`;

  md += `## Enlaces Externos (${report.externalLinks.length})\n\n`;
  for (const link of report.externalLinks) {
    md += `- ${link}\n`;
  }

  return md;
}

// Main
async function main() {
  console.log('='.repeat(60));
  console.log('  CRAWLER COMPLETO - pablomoche.cl');
  console.log('='.repeat(60));
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Max pages: ${MAX_PAGES}`);
  console.log(`  Delay: ${DELAY_MS}ms`);
  console.log('='.repeat(60) + '\n');

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  // Seed the queue with the homepage
  queue.push(normalizeUrl(BASE_URL));

  // Also seed with known section URLs from Joomla menu
  const seedUrls = [
    '/medico',
    '/espiritual',
    '/evolutivo',
    '/pedagogico',
    '/social-cultural-economico',
    '/del-humor',
    '/de-interes-general',
    '/alimentacion',
    '/sobre-medicamentos',
    '/enfermedades',
    '/tecnologia-y-sus-efectos',
    '/otros',
    '/karma-destino-y-biografia',
    '/reencarnacion',
    '/muerte',
    '/otras',
    '/pedagogia',
    '/medios-tecnologicos',
  ];

  for (const seed of seedUrls) {
    const normalized = normalizeUrl(`${BASE_URL}${seed}`);
    if (normalized && !queue.includes(normalized)) {
      queue.push(normalized);
    }
  }

  // BFS crawl
  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const url = queue.shift();
    if (visited.has(url)) continue;

    await crawlPage(url);
    await delay(DELAY_MS);
  }

  console.log('\n' + '='.repeat(60));
  console.log('  CRAWL COMPLETE - Generating reports...');
  console.log('='.repeat(60) + '\n');

  // Build report
  const report = buildArchitectureReport();

  // Save all data
  writeFileSync(join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`  -> report.json`);

  // Save pages with content (for content migration)
  const contentPages = pages.map((p) => ({
    url: p.url,
    pageType: p.pageType,
    title: p.metadata?.h1 || p.metadata?.title || '',
    metaDescription: p.metadata?.metaDescription || '',
    ogImage: p.metadata?.ogImage || '',
    headings: p.structure?.headings || [],
    images: p.structure?.images || [],
    rawContent: p.rawContent || '',
  }));
  writeFileSync(join(OUTPUT_DIR, 'pages-content.json'), JSON.stringify(contentPages, null, 2));
  console.log(`  -> pages-content.json`);

  // Save architecture markdown report
  const mdReport = generateMarkdownReport(report);
  writeFileSync(join(OUTPUT_DIR, 'architecture.md'), mdReport);
  console.log(`  -> architecture.md`);

  // Save sitemap
  const sitemap = pages.map((p) => ({
    url: p.url,
    type: p.pageType,
    title: p.metadata?.title || '',
  }));
  writeFileSync(join(OUTPUT_DIR, 'sitemap.json'), JSON.stringify(sitemap, null, 2));
  console.log(`  -> sitemap.json`);

  // Save assets list
  writeFileSync(join(OUTPUT_DIR, 'assets.json'), JSON.stringify(report.assets, null, 2));
  console.log(`  -> assets.json`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Pages crawled:    ${pages.length}`);
  console.log(`  Images found:     ${assets.images.size}`);
  console.log(`  CSS files:        ${assets.css.size}`);
  console.log(`  JS files:         ${assets.js.size}`);
  console.log(`  External links:   ${externalLinks.size}`);
  console.log(`  Broken links:     ${brokenLinks.length}`);
  console.log(`\n  Output: ${OUTPUT_DIR}/`);
  console.log('='.repeat(60));
}

main().catch(console.error);
