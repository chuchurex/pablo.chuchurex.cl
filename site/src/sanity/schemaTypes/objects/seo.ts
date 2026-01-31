import { defineField, defineType } from 'sanity'

export const seoType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Titulo SEO',
      description: 'Sobreescribe el titulo de la pagina si se proporciona',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Mantenerlo bajo 70 caracteres para mejor SEO'),
    }),
    defineField({
      name: 'description',
      title: 'Descripcion SEO',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160).warning('Mantenerlo bajo 160 caracteres para mejor SEO'),
    }),
    defineField({
      name: 'image',
      title: 'Imagen para redes sociales',
      description: 'Recomendado: 1200x630px',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'noIndex',
      title: 'Ocultar de buscadores',
      description: 'Ocultar esta pagina de Google y otros buscadores',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
