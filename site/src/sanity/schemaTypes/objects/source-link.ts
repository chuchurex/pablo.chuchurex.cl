import { defineField, defineType } from 'sanity'
import { LinkIcon } from '@sanity/icons'

export const sourceLinkType = defineType({
  name: 'sourceLink',
  title: 'Fuente Original',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'author',
      title: 'Autor original',
      type: 'string',
    }),
    defineField({
      name: 'publication',
      title: 'Medio/Publicacion',
      description: 'Ej: Infobae, Clarin, Emol',
      type: 'string',
    }),
    defineField({
      name: 'url',
      title: 'URL de la fuente',
      type: 'url',
      validation: (rule) =>
        rule.uri({
          scheme: ['http', 'https'],
        }),
    }),
  ],
})
