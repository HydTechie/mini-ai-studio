import request from 'supertest';
import Fastify from 'fastify';
import authRoutes from '../routes/auth';
import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';

let mongod: any;
let app: any;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  app = Fastify();
  app.register(authRoutes, {prefix:'/auth'});
  await app.ready();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test('register & login', async () => {
  const server = app.server;
  const res = await request(server).post('/auth/register').send({email:'a@b.com', password:'pass'});
  expect(res.body.token).toBeDefined();
  const res2 = await request(server).post('/auth/login').send({email:'a@b.com', password:'pass'});
  expect(res2.body.token).toBeDefined();
});
