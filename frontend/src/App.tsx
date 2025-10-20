import React, {useState, useEffect} from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function useAuth(){
  const [token,setToken] = useState<string | null>(localStorage.getItem('token'));
  const save = (t:string)=>{ localStorage.setItem('token', t); setToken(t); }
  const logout = ()=>{ localStorage.removeItem('token'); setToken(null); }
  return {token, save, logout};
}

export default function App(){
  const {token, save, logout} = useAuth();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [prompt,setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [gens, setGens] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ if(token) fetchGens(); }, [token]);

  async function fetchGens(){
    try{
      const res = await axios.get(API + '/api/generations', {headers: {Authorization: 'Bearer ' + token}});
      setGens(res.data.items || []);
    }catch(e:any){
      console.error(e);
      setError(e?.response?.data?.error || 'Failed to fetch');
    }
  }

  async function register(){
    try{
      const res = await axios.post(API + '/auth/register', {email, password});
      save(res.data.token);
    }catch(e:any){ setError(e?.response?.data?.error || 'register failed'); }
  }
  async function login(){
    try{
      const res = await axios.post(API + '/auth/login', {email, password});
      save(res.data.token);
    }catch(e:any){ setError(e?.response?.data?.error || 'login failed'); }
  }

  async function generate(){
    if(!file || !prompt) { setError('file + prompt required'); return; }
    setLoading(true); setError(null);
    try{
      const form = new FormData();
      form.append('file', file);
      form.append('prompt', prompt);
      const res = await axios.post(API + '/api/generate', form, {
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/form-data' }
      });
      // optimistic refresh
      fetchGens();
    }catch(e:any){
      // handle simulated API errors gracefully
      const msg = e?.response?.data?.error || e.message || 'Generation failed';
      setError(msg);
    }finally{ setLoading(false); }
  }

  if(!token) return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mini AI Studio — Login / Register</h1>
      {error && <div className="bg-red-100 p-2 mb-2">{error}</div>}
      <input className="w-full p-2 mb-2 border" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="w-full p-2 mb-2 border" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={login} className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
        <button onClick={register} className="px-4 py-2 bg-green-600 text-white rounded">Register</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mini AI Studio</h1>
        <div>
          <button onClick={()=>{logout(); setGens([]);}} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>
      {error && <div className="bg-red-100 p-2 mb-2">{error}</div>}
      <div className="mb-4 p-4 border rounded">
        <h2 className="font-semibold mb-2">Upload image + prompt</h2>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} className="mb-2" />
        <input className="w-full p-2 mb-2 border" placeholder="prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} />
        <button onClick={generate} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
          {loading? 'Generating...' : 'Generate (simulate)'}
        </button>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Recent generations (last 5)</h2>
        {gens.length===0 && <div className="text-sm text-gray-600">No generations yet.</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gens.map(g=>(
            <div key={g.id} className="border p-2 rounded">
              <div className="text-sm text-gray-500">{new Date(g.createdAt).toLocaleString()}</div>
              <div className="font-medium">{g.prompt}</div>
              {g.resultUrl && <img src={(API + g.resultUrl).replace('http://localhost:4000http://','http://')} alt="result" className="mt-2 w-full h-40 object-cover" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
