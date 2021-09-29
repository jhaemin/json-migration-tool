import { JsonMigrationRules } from 'src/types'

const rules: JsonMigrationRules = [
  {
    type: 'add',
    path: 'mankind.contributions',
    defaultValue: 'archaeology, anthropology, genetics',
  },
  {
    type: 'add',
    path: 'plantation',
    defaultValue: {},
  },
  {
    type: 'add',
    path: 'plantation.description',
    defaultValue:
      'An area in which trees have been planted, especially for commercial purposes.',
  },
  {
    type: 'remove',
    path: 'robots.introduction',
  },
  {
    type: 'move',
    fromPath: 'robots',
    toPath: 'inhuman',
  },
  {
    type: 'add',
    path: 'inhuman.species',
    defaultValue: 'Magnificent',
  },
  {
    type: 'convert',
    path: 'heroes',
    convertFunction: (data) => {
      return Object.keys(data).map((heroKey) => ({
        key: heroKey,
        ...data[heroKey],
      }))
    },
  },
  {
    type: 'add',
    path: 'heroes.age',
    defaultValue: 10,
    bulk: true,
  },
  {
    type: 'add',
    path: 'buildings.age',
    defaultValue: 10,
    bulk: true,
  },
]

export default rules
