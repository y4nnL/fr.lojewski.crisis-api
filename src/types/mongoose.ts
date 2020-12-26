import * as mongoose from "mongoose"

export type SchemaDefinition<T> = mongoose.SchemaDefinition &
  Record<keyof T,
    mongoose.SchemaTypeOptions<any>
    | Function
    | string
    | mongoose.Schema
    | mongoose.Schema[]
    | Array<mongoose.SchemaTypeOptions<any>>
    | Function[]
    | mongoose.SchemaDefinition
    | mongoose.SchemaDefinition[]>

export class SchemaClass<T> extends mongoose.Schema {
  methods: T
  constructor(definition?: mongoose.SchemaDefinition, methods?: T, options?: mongoose.SchemaOptions) {
    super(definition, options)
    if (methods) {
      this.methods = methods
    }
  }
}
