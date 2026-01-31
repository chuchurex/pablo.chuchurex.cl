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
      title: 'Lo que Steiner enseno',
      description: 'El conocimiento que Rudolf Steiner entrego sobre este tema',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'modernConnection',
      title: 'Lo que la ciencia llego a reconocer',
      description: 'Como la ciencia moderna llego a reconocer lo que Steiner ya habia ensenado',
      type: 'text',
      rows: 4,
    }),
  ],
})
