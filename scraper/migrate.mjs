#!/usr/bin/env node
/**
 * migrate.mjs
 * Migrates scraped articles from pablomoche.cl to Sanity CMS
 *
 * Usage: node migrate.mjs [--dry-run] [--skip-images] [--skip-categories]
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ============================================================
// Config
// ============================================================

const DRY_RUN = process.argv.includes('--dry-run')
const SKIP_IMAGES = process.argv.includes('--skip-images')
const SKIP_CATEGORIES = process.argv.includes('--skip-categories')

const client = createClient({
  projectId: '5vh3wgvg',
  dataset: 'production',
  apiVersion: '2025-11-01',
  token: 'skdgb5hXgGrwy9plOw679n3UiV8sIIfB6JZ8aBA5d5Csi0g75Z8wx5GNfCg54xVmA5FTYecRyGNV1TnBS3lmuuEwe8RTLHqDpCqkpUFayam9DqhAub2m4wSJidSaUR3cbyJD9kItLl2IS3WccOU1DEkGmRZGvq9ZzkKxCSKabx8CwsA4RkYC',
  useCdn: false,
})

// ============================================================
// Category mapping: old (scraper) → new (Sanity)
// ============================================================

const CATEGORIES = [
  {
    _id: 'cat-salud',
    name: 'Salud',
    slug: 'salud',
    icon: '🏥',
    order: 1,
    description: 'Steiner y la ciencia medica moderna',
    subcategories: [
      { _id: 'cat-alimentacion', name: 'Alimentacion', slug: 'alimentacion', icon: '🍎', order: 1 },
      { _id: 'cat-medicamentos', name: 'Medicamentos', slug: 'medicamentos', icon: '💊', order: 2 },
      { _id: 'cat-enfermedades', name: 'Enfermedades', slug: 'enfermedades', icon: '🦠', order: 3 },
    ],
  },
  {
    _id: 'cat-desarrollo',
    name: 'Desarrollo Humano',
    slug: 'desarrollo-humano',
    icon: '🌱',
    order: 2,
    description: 'Septenios y neurociencia',
    subcategories: [
      { _id: 'cat-pedagogia', name: 'Pedagogia', slug: 'pedagogia', icon: '📚', order: 1 },
      { _id: 'cat-tecnologia', name: 'Tecnologia y ninos', slug: 'tecnologia-y-ninos', icon: '📱', order: 2 },
    ],
  },
  {
    _id: 'cat-cosmos',
    name: 'Cosmos',
    slug: 'cosmos',
    icon: '🌌',
    order: 3,
    description: 'Esferas planetarias y astrofisica',
    subcategories: [
      { _id: 'cat-evolutivo', name: 'Evolutivo', slug: 'evolutivo', icon: '🔄', order: 1 },
    ],
  },
  {
    _id: 'cat-espiritu',
    name: 'Espiritu',
    slug: 'espiritu',
    icon: '✨',
    order: 4,
    description: 'Antroposofia y casos documentados',
    subcategories: [
      { _id: 'cat-karma', name: 'Karma y Destino', slug: 'karma-y-destino', icon: '🔮', order: 1 },
      { _id: 'cat-reencarnacion', name: 'Reencarnacion', slug: 'reencarnacion', icon: '♻️', order: 2 },
      { _id: 'cat-muerte', name: 'Muerte', slug: 'muerte', icon: '🕊️', order: 3 },
    ],
  },
  {
    _id: 'cat-sociedad',
    name: 'Sociedad',
    slug: 'sociedad',
    icon: '🏛️',
    order: 5,
    description: 'Trimembracion y economia moderna',
    subcategories: [
      { _id: 'cat-social', name: 'Social y Cultural', slug: 'social-cultural', icon: '🤝', order: 1 },
    ],
  },
  {
    _id: 'cat-humor',
    name: 'Humor',
    slug: 'humor',
    icon: '😄',
    order: 6,
    description: 'El lado humano de Pablo',
    subcategories: [],
  },
  {
    _id: 'cat-general',
    name: 'Interes General',
    slug: 'interes-general',
    icon: '📰',
    order: 7,
    description: 'Articulos diversos',
    subcategories: [],
  },
]

// Maps old scraper category/subcategory to new Sanity category _id
const CATEGORY_MAP = {
  'medico:alimentacion': 'cat-alimentacion',
  'medico:medicamentos': 'cat-medicamentos',
  'medico:enfermedades': 'cat-enfermedades',
  'medico:undefined': 'cat-salud',
  'medico:null': 'cat-salud',
  'medico:': 'cat-salud',
  'espiritual:karma': 'cat-karma',
  'espiritual:reencarnacion': 'cat-reencarnacion',
  'espiritual:muerte': 'cat-muerte',
  'espiritual:undefined': 'cat-espiritu',
  'espiritual:null': 'cat-espiritu',
  'espiritual:': 'cat-espiritu',
  'evolutivo:undefined': 'cat-evolutivo',
  'evolutivo:null': 'cat-evolutivo',
  'evolutivo:': 'cat-evolutivo',
  'pedagogico:undefined': 'cat-pedagogia',
  'pedagogico:null': 'cat-pedagogia',
  'pedagogico:': 'cat-pedagogia',
  'social:undefined': 'cat-social',
  'social:null': 'cat-social',
  'social:': 'cat-social',
  'humor:undefined': 'cat-humor',
  'humor:null': 'cat-humor',
  'humor:': 'cat-humor',
  'general:undefined': 'cat-general',
  'general:null': 'cat-general',
  'general:': 'cat-general',
}

function mapCategory(oldCat, oldSubcat) {
  const key = `${oldCat}:${oldSubcat || ''}`
  return CATEGORY_MAP[key] || CATEGORY_MAP[`${oldCat}:`] || 'cat-general'
}

// ============================================================
// Helpers
// ============================================================

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Convert plain text to Portable Text blocks */
function textToPortableText(text) {
  if (!text) return []
  const paragraphs = text.split(/\n{2,}/).filter(Boolean)
  return paragraphs.map((p, i) => ({
    _type: 'block',
    _key: `block-${i}`,
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: `span-${i}`,
        text: p.replace(/\n/g, ' ').trim(),
        marks: [],
      },
    ],
  }))
}

/** Download image from URL and upload to Sanity */
async function uploadImage(imageUrl, filename) {
  return new Promise((resolveP, rejectP) => {
    const protocol = imageUrl.startsWith('https') ? https : http
    protocol
      .get(imageUrl, { timeout: 15000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Follow redirect
          uploadImage(res.headers.location, filename).then(resolveP).catch(rejectP)
          return
        }
        if (res.statusCode !== 200) {
          rejectP(new Error(`HTTP ${res.statusCode} for ${imageUrl}`))
          return
        }
        const contentType = res.headers['content-type'] || 'image/png'
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          const buffer = Buffer.concat(chunks)
          client.assets
            .upload('image', buffer, { filename, contentType })
            .then(resolveP)
            .catch(rejectP)
        })
        res.on('error', rejectP)
      })
      .on('error', rejectP)
  })
}

/** Slugify text */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 96)
}

// ============================================================
// Migration steps
// ============================================================

async function createCategories() {
  console.log('\n=== Creating categories ===\n')
  const tx = client.transaction()

  for (const cat of CATEGORIES) {
    const doc = {
      _id: cat._id,
      _type: 'category',
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
      icon: cat.icon,
      order: cat.order,
    }
    tx.createOrReplace(doc)
    console.log(`  [category] ${cat.name} (${cat._id})`)

    for (const sub of cat.subcategories) {
      const subDoc = {
        _id: sub._id,
        _type: 'category',
        name: sub.name,
        slug: { _type: 'slug', current: sub.slug },
        icon: sub.icon,
        order: sub.order,
        parent: { _type: 'reference', _ref: cat._id },
      }
      tx.createOrReplace(subDoc)
      console.log(`    [subcategory] ${sub.name} (${sub._id})`)
    }
  }

  if (!DRY_RUN) {
    await tx.commit()
    console.log('\n  Categories committed to Sanity')
  } else {
    console.log('\n  [dry-run] Would commit categories')
  }
}

async function migrateArticles() {
  console.log('\n=== Migrating articles ===\n')

  const articlesPath = resolve(__dirname, 'output', 'articles.json')
  const articles = JSON.parse(readFileSync(articlesPath, 'utf-8'))
  console.log(`  Found ${articles.length} articles to migrate\n`)

  // Track slugs to detect duplicates
  const seenSlugs = new Set()
  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const article of articles) {
    const slug = slugify(article.slug || article.title)

    // Skip duplicates (medios-tecnologicos = tecnologia-y-sus-efectos)
    if (seenSlugs.has(slug)) {
      console.log(`  [skip] Duplicate slug: ${slug}`)
      skipped++
      continue
    }
    seenSlugs.add(slug)

    const categoryId = mapCategory(article.category, article.subcategory)

    // Build article document
    const doc = {
      _type: 'article',
      title: article.title.substring(0, 200),
      slug: { _type: 'slug', current: slug },
      excerpt: (article.excerpt || '').substring(0, 300),
      category: { _type: 'reference', _ref: categoryId },
      content: textToPortableText(article.content),
      status: 'published',
      legacyId: article.id,
      source: {
        _type: 'sourceLink',
        author: article.author !== 'Administrador' ? article.author : undefined,
        url: article.sourceUrl || undefined,
      },
    }

    if (article.publishDate) {
      doc.publishedDate = article.publishDate
    }

    // Upload featured image
    if (article.featuredImage && !SKIP_IMAGES) {
      try {
        const imgFilename = article.featuredImage.split('/').pop()
        console.log(`  [image] Uploading ${imgFilename}...`)
        const asset = await uploadImage(article.featuredImage, imgFilename)
        doc.featuredImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt: article.title,
        }
        await sleep(500) // Rate limiting
      } catch (err) {
        console.log(`  [image-error] ${article.featuredImage}: ${err.message}`)
      }
    }

    if (!DRY_RUN) {
      try {
        const result = await client.create(doc)
        console.log(`  [OK] ${article.title.substring(0, 60)}... → ${result._id}`)
        migrated++
        await sleep(300) // Rate limiting
      } catch (err) {
        console.log(`  [ERROR] ${article.title.substring(0, 60)}...: ${err.message}`)
        errors++
      }
    } else {
      console.log(`  [dry-run] Would create: ${article.title.substring(0, 60)}... → ${categoryId}`)
      migrated++
    }
  }

  console.log(`\n  Results: ${migrated} migrated, ${skipped} skipped, ${errors} errors`)
}

async function createSiteSettings() {
  console.log('\n=== Creating site settings ===\n')

  const doc = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'Pablo Moche',
    tagline: 'Articulos con Sentido',
    heroSubtitle: 'Un puente entre la Antroposofia y el mundo moderno. Articulos que conectan la vision espiritual con la ciencia actual.',
    footerText: 'Pablo Moche - Articulos con Sentido. Un puente entre la Antroposofia y el mundo moderno.',
  }

  if (!DRY_RUN) {
    await client.createOrReplace(doc)
    console.log('  Site settings created')
  } else {
    console.log('  [dry-run] Would create site settings')
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('=' .repeat(60))
  console.log('  MIGRATION: pablomoche.cl → Sanity CMS')
  console.log('=' .repeat(60))
  if (DRY_RUN) console.log('  [DRY RUN MODE - no changes will be made]')
  if (SKIP_IMAGES) console.log('  [SKIP IMAGES MODE]')

  if (!SKIP_CATEGORIES) {
    await createCategories()
  }

  await migrateArticles()
  await createSiteSettings()

  console.log('\n' + '=' .repeat(60))
  console.log('  Migration complete!')
  console.log('=' .repeat(60))
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
