import {Schema, model} from 'mongoose';

const UserSchema = new Schema({
  email: {type: String, required: true, unique: true},
  passwordHash: {type: String, required: true},
  name: {type: String}
}, {timestamps:true});

export default model('User', UserSchema);
