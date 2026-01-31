import { defineField, defineType } from 'sanity'
import { SparklesIcon } from '@sanity/icons'

export const bridgeContextType = defineType({
  name: 'bridgeContext',
  title: 'El Puente',
  type: 'object',
  icon: SparklesIcon,
  description: 'Conecta la vision antroposofica con la ciencia moderna',
  fields: [
    defineField({
      name: 'anthroposophicInsight',
      title: 'Vision Antroposofica',
      description: 'Lo que dijo Steiner o la Antroposofia sobre este tema',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'modernConnection',
      title: 'Conexion Moderna',
      description: 'Por que este articulo importa hoy — como la ciencia moderna lo valida',
      type: 'text',
      rows: 4,
    }),
  ],
})
