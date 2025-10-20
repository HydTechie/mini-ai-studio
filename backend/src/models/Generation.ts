import {Schema, model, Types} from 'mongoose';

const GenerationSchema = new Schema({
  user: {type: Types.ObjectId, ref: 'User', required: true},
  prompt: {type: String, required: true},
  inputImagePath: {type: String, required: true},
  resultImagePath: {type: String},
  status: {type: String, enum: ['pending','done','failed'], default: 'done'}
}, {timestamps:true});

export default model('Generation', GenerationSchema);
