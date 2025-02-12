import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Scope = sequelizeClient.define(
    'scope',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      scopeName: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )
  ;(Scope as any).associate = (models: any): void => {
    ;(Scope as any).belongsTo(models.user, { foreignKey: 'userId', allowNull: true })
    ;(Scope as any).belongsTo(models.group, { foreignKey: 'groupId', allowNull: true })
    ;(Scope as any).hasMany(models.scopeType, { foreignKey: 'scopeName' })
  }

  return Scope
}
