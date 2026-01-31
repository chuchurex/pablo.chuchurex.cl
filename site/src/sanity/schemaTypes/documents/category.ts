import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const categoryType = defineType({
  name: 'category',
  title: 'Categoria',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
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
      name: 'description',
      title: 'Descripcion',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'icon',
      title: 'Emoji/Icono',
      description: 'Un emoji que represente esta categoria (ej: \uD83C\uDFE5 para Salud)',
      type: 'string',
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'parent',
      title: 'Categoria padre',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Para subcategorias',
    }),
    defineField({
      name: 'image',
      title: 'Imagen de la categoria',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'order',
      title: 'Orden en menu',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'parent.name',
      media: 'image',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `Sub de: ${subtitle}` : 'Categoria principal',
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Orden en menu',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
