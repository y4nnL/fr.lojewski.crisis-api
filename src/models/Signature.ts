import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'
import { SchemaDefinition, SchemaClass } from '@/types'

type Signature = {
  _id: string
}

type SignatureDocument = Signature & Document

const signatureDefinition: SchemaDefinition<Signature> = {
  _id: {
    type: Schema.Types.String,
    required: true,
  },
}

const signatureSchema = new SchemaClass(signatureDefinition, {}, { timestamps: true })
const SignatureModel = mongoose.model<SignatureDocument>('Signature', signatureSchema)

export {
  Signature,
  SignatureDocument,
  SignatureModel,
}
