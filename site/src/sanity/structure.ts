import type { StructureResolver } from 'sanity/structure'
import { DocumentTextIcon, TagIcon, DocumentIcon, CalendarIcon, CogIcon } from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Pablo Moche')
    .items([
      S.listItem()
        .title('Articulos')
        .icon(DocumentTextIcon)
        .schemaType('article')
        .child(S.documentTypeList('article').title('Articulos')),

      S.listItem()
        .title('Categorias')
        .icon(TagIcon)
        .schemaType('category')
        .child(S.documentTypeList('category').title('Categorias')),

      S.divider(),

      S.listItem()
        .title('Paginas')
        .icon(DocumentIcon)
        .schemaType('page')
        .child(S.documentTypeList('page').title('Paginas')),

      S.listItem()
        .title('Seminarios')
        .icon(CalendarIcon)
        .schemaType('seminar')
        .child(S.documentTypeList('seminar').title('Seminarios')),

      S.divider(),

      S.listItem()
        .title('Configuracion del Sitio')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Configuracion del Sitio'),
        ),
    ])
