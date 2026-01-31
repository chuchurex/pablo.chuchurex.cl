import { defineField, defineType } from 'sanity'
import { SparklesIcon } from '@sanity/icons'

export const bridgeContextType = defineType({
  name: 'bridgeContext',
  title: 'El Puente',
  type: 'object',
  icon: SparklesIcon,
  description: 'Conecta la visión antroposófica con la ciencia moderna',
  fields: [
    defineField({
      name: 'anthroposophicInsight',
      title: 'Lo que Steiner enseñó',
      description: 'El conocimiento que Rudolf Steiner entregó sobre este tema',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'modernConnection',
      title: 'Lo que la ciencia llegó a reconocer',
      description: 'Cómo la ciencia moderna llegó a reconocer lo que Steiner ya había enseñado',
      type: 'text',
      rows: 4,
    }),
  ],
})
