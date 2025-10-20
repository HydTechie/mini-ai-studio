import {FastifyInstance} from 'fastify';
import multipart from 'fastify-multipart';
import Generation from '../models/Generation';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function authFromHeader(req:any){
  const auth = req.headers['authorization'];
  if(!auth) return null;
  const m = auth.match(/^Bearer\s+(.*)$/);
  if(!m) return null;
  try{
    const payload = jwt.verify(m[1], process.env.JWT_SECRET || 'dev') as any;
    return payload;
  }catch(e){
    return null;
  }
}

export default async function (app: FastifyInstance) {

  app.post('/generate', async (req: any, reply) => {
    // simulate occasional API errors (10%)
    if(Math.random() < 0.10){
      return reply.status(502).send({error:'Modelia API error: upstream timeout (simulated)'});
    }

    const user = authFromHeader(req);
    if(!user) return reply.status(401).send({error:'unauthorized'});

    const prompt = req.body?.prompt || req.body?.fields?.prompt || '';
    const file = req.raw?.files?.file || req.body?.file || req.body?.fields?.file;
    // fast workaround: if multipart, fastify-multipart exposes files differently; read from req.raw.files when present
    const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname,'..','uploads');
    if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, {recursive:true});

    // save uploaded file if present
    let inputPath = '';
    try{
      if(file && file.file && file.file.path){
        inputPath = file.file.path;
      } else if(req.raw && req.raw.files && req.raw.files[0]){
        // multer-like
        const f = req.raw.files[0];
        inputPath = f.filepath || f.path || f.path;
      } else {
        // try to read base64 body (support from client)
        if(req.body && req.body.imageBase64){
          const buf = Buffer.from(req.body.imageBase64, 'base64');
          const name = crypto.randomBytes(8).toString('hex') + '.jpg';
          const out = path.join(uploadsDir, name);
          fs.writeFileSync(out, buf);
          inputPath = out;
        } else {
          return reply.status(400).send({error:'no file uploaded'});
        }
      }
    }catch(e){
      app.log.error(e);
      return reply.status(500).send({error:'failed to save uploaded file'});
    }

    // simulate generation by copying input to result with watermark text in filename
    const resultName = 'result-' + path.basename(inputPath);
    const resultPath = path.join(uploadsDir, resultName);
    fs.copyFileSync(inputPath, resultPath);

    // persist generation record
    const gen = await Generation.create({
      user: user.id,
      prompt,
      inputImagePath: inputPath,
      resultImagePath: resultPath,
      status: 'done'
    });

    // cap list at 5 handled on retrieval
    return reply.send({id:gen._id, resultUrl:`/uploads/${path.basename(resultPath)}`, prompt});
  });

  app.get('/generations', async (req:any, reply) => {
    const user = authFromHeader(req);
    if(!user) return reply.status(401).send({error:'unauthorized'});
    const list = await Generation.find({user: user.id}).sort({createdAt:-1}).limit(5).lean();
    return reply.send({items: list.map(g => ({
      id: g._id,
      prompt: g.prompt,
      resultUrl: `/uploads/${path.basename(g.resultImagePath || '')}`,
      createdAt: g.createdAt
    }))});
  });

  // static uploads
  app.register(async (instance) => {
    instance.get('/uploads/:file', async (req:any, reply:any) => {
      const file = req.params.file as string;
      const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname,'..','uploads');
      const full = path.join(uploadsDir, file);
      if(!fs.existsSync(full)) return reply.status(404).send({error:'not found'});
      return reply.sendFile(full, path.basename(full));
    });
  });
}
