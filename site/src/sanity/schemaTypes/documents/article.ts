import { defineField, defineType } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const articleType = defineType({
  name: 'article',
  title: 'Articulo',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titulo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 96),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Extracto',
      description: 'Resumen corto del articulo para cards y SEO',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300).warning('Mantenerlo bajo 300 caracteres'),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Imagen destacada',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          validation: (rule) => rule.required().warning('Importante para accesibilidad'),
        }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bridgeContext',
      title: 'El Puente',
      type: 'bridgeContext',
      description: 'Opcional: conecta este articulo con la vision antroposofica',
    }),
    defineField({
      name: 'content',
      title: 'Contenido',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            decorators: [
              { title: 'Negrita', value: 'strong' },
              { title: 'Cursiva', value: 'em' },
              { title: 'Subrayado', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Enlace',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (rule) =>
                      rule.uri({
                        scheme: ['http', 'https', 'mailto'],
                      }),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    title: 'Abrir en nueva pestana',
                    type: 'boolean',
                    initialValue: true,
                  }),
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Texto alternativo',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Leyenda',
              type: 'string',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'source',
      title: 'Fuente original',
      type: 'sourceLink',
    }),
    defineField({
      name: 'publishedDate',
      title: 'Fecha de publicacion',
      type: 'date',
      options: {
        dateFormat: 'DD-MM-YYYY',
      },
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Borrador', value: 'draft' },
          { title: 'Publicado', value: 'published' },
          { title: 'Archivado', value: 'archived' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
    defineField({
      name: 'legacyId',
      title: 'ID Legacy',
      type: 'string',
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category.name',
      media: 'featuredImage',
    },
  },
  orderings: [
    {
      title: 'Fecha de publicacion',
      name: 'publishedDateDesc',
      by: [{ field: 'publishedDate', direction: 'desc' }],
    },
    {
      title: 'Titulo A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
})
