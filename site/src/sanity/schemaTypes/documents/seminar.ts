import { defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons'

export const seminarType = defineType({
  name: 'seminar',
  title: 'Seminario',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titulo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripcion',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'type',
      title: 'Modalidad',
      type: 'string',
      options: {
        list: [
          { title: 'Online', value: 'online' },
          { title: 'Presencial', value: 'presencial' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'scheduleUrl',
      title: 'Link para agendar',
      type: 'url',
    }),
    defineField({
      name: 'isActive',
      title: 'Activo',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'image',
      title: 'Imagen',
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'type',
      media: 'image',
    },
  },
})
