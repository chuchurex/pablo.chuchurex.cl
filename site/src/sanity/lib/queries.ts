import { defineQuery } from 'next-sanity'

// ============================================================
// Site Settings
// ============================================================

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0]{
    siteName,
    tagline,
    heroImage{
      asset->{_id, url, metadata{lqip, dimensions}},
      alt
    },
    heroSubtitle,
    scheduleUrl,
    contactEmail,
    socialLinks[]{platform, url},
    footerText
  }
`)

// ============================================================
// Categories
// ============================================================

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category" && !defined(parent)] | order(order asc){
    _id,
    name,
    "slug": slug.current,
    description,
    icon,
    image{
      asset->{_id, url, metadata{lqip, dimensions}},
      alt
    },
    "articleCount": count(*[_type == "article" && references(^._id) && status == "published"]),
    "subcategories": *[_type == "category" && parent._ref == ^._id] | order(order asc){
      _id,
      name,
      "slug": slug.current,
      "articleCount": count(*[_type == "article" && references(^._id) && status == "published"])
    }
  }
`)

export const CATEGORY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "category" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    description,
    icon,
    image{
      asset->{_id, url, metadata{lqip, dimensions}},
      alt
    },
    "parent": parent->{
      _id,
      name,
      "slug": slug.current
    },
    "subcategories": *[_type == "category" && parent._ref == ^._id] | order(order asc){
      _id,
      name,
      "slug": slug.current,
      "articleCount": count(*[_type == "article" && references(^._id) && status == "published"])
    }
  }
`)

// ============================================================
// Articles
// ============================================================

export const ARTICLES_BY_CATEGORY_QUERY = defineQuery(`
  *[_type == "article" && status == "published" && (
    category._ref == $categoryId
    || category._ref in *[_type == "category" && parent._ref == $categoryId]._id
  )] | order(publishedDate desc){
    _id,
    title,
    "slug": slug.current,
    excerpt,
    featuredImage{
      asset->{_id, url, metadata{lqip, dimensions}},
      alt
    },
    "category": category->{name, "slug": slug.current},
    publishedDate,
    source{publication},
    bridgeContext{anthroposophicInsight, modernConnection}
  }
`)

export const LATEST_ARTICLES_QUERY = defineQuery(`
  *[_type == "article" && status == "published"] | order(publishedDate desc)[0...$limit]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    featuredImage{
      asset->{_id, url, metadata{lqip, dimensions}},
      alt
    },
    "category": category->{name, "slug": slug.current},
    publishedDate,
    bridgeContext{anthroposophicInsight, modernConnection}
  }
`)

export const ARTICLE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    featuredImage{
      asset->{_id, url, metadata{lqip, dimensions}},
      alt
    },
    "category": category->{
      _id,
      name,
      "slug": slug.current,
      "parent": parent->{name, "slug": slug.current}
    },
    bridgeContext{
      anthroposophicInsight,
      modernConnection
    },
    content[]{
      ...,
      _type == "image" => {
        asset->{_id, url, metadata{lqip, dimensions}},
        alt,
        caption
      }
    },
    source{author, publication, url},
    publishedDate,
    "seo": {
      "title": coalesce(seo.title, title),
      "description": coalesce(seo.description, excerpt, ""),
      "image": seo.image,
      "noIndex": seo.noIndex == true
    }
  }
`)

export const ALL_ARTICLE_SLUGS_QUERY = defineQuery(`
  *[_type == "article" && status == "published" && defined(slug.current)]{
    "slug": slug.current,
    "category": category->slug.current
  }
`)

// ============================================================
// Pages
// ============================================================

export const PAGE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    content[]{
      ...,
      _type == "image" => {
        asset->{_id, url, metadata{lqip, dimensions}},
        alt,
        caption
      }
    },
    template,
    "seo": {
      "title": coalesce(seo.title, title),
      "description": coalesce(seo.description, ""),
      "image": seo.image,
      "noIndex": seo.noIndex == true
    }
  }
`)

// ============================================================
// Seminars
// ============================================================

export const ACTIVE_SEMINARS_QUERY = defineQuery(`
  *[_type == "seminar" && isActive == true]{
    _id,
    title,
    description,
    type,
    scheduleUrl,
    image{
      asset->{_id, url, metadata{lqip, dimensions}},
      alt
    }
  }
`)

// ============================================================
// Sitemap
// ============================================================

export const SITEMAP_QUERY = defineQuery(`
  *[
    (_type == "article" && status == "published" && defined(slug.current))
    || (_type == "page" && defined(slug.current))
    || (_type == "category" && defined(slug.current))
  ]{
    "href": select(
      _type == "article" => "/puentes/" + category->slug.current + "/" + slug.current,
      _type == "category" => "/puentes/" + slug.current,
      _type == "page" => "/" + slug.current
    ),
    _updatedAt
  }
`)
