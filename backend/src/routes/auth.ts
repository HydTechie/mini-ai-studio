import {FastifyInstance} from 'fastify';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function (app: FastifyInstance) {
  app.post('/register', async (req, reply) => {
    const {email, password, name} = req.body as any;
    if(!email || !password) return reply.status(400).send({error:'email & password required'});
    const existing = await User.findOne({email});
    if(existing) return reply.status(400).send({error:'user exists'});
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({email, passwordHash, name});
    const token = jwt.sign({id:user._id, email:user.email}, process.env.JWT_SECRET || 'dev', {expiresIn:'7d'});
    return {token, user:{email:user.email, id:user._id}};
  });

  app.post('/login', async (req, reply) => {
    const {email, password} = req.body as any;
    if(!email || !password) return reply.status(400).send({error:'email & password required'});
    const user = await User.findOne({email});
    if(!user) return reply.status(401).send({error:'invalid credentials'});
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return reply.status(401).send({error:'invalid credentials'});
    const token = jwt.sign({id:user._id, email:user.email}, process.env.JWT_SECRET || 'dev', {expiresIn:'7d'});
    return {token, user:{email:user.email, id:user._id}};
  });
}
