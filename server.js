// server.js - Hype Feet backend (Express)
// Endpoints:
// POST /api/frete  -> calls MelhorEnvio (if token provided) or returns simulated options
// Notes: set MELHOR_ENVIO_TOKEN and SENDER_CEP in .env to enable real quotes.

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // optional
const PORT = process.env.PORT || 3000;

// health check
app.get('/api/health', (req, res) => res.json({ok:true, ts:Date.now()}));

// /api/frete endpoint
app.post('/api/frete', async (req, res) => {
  const body = req.body || {};
  const cep = (body.cep_destino || '').replace(/\D/g,'');
  if(!cep || cep.length !== 8) return res.status(400).json({message:'CEP inválido'});

  // If MELHOR_ENVIO_TOKEN is present, call MelhorEnvio API
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const sender_zip = process.env.SENDER_CEP || '01001000';
  try {
    if(token){
      // MelhorEnvio API endpoint example (v2) - this is a template, adapt per official docs
      const url = 'https://api.melhorenvio.com.br/v2/me/shipment/calculate'; // verify actual endpoint in docs
      const payload = {
        from: { zip_code: sender_zip },
        to: { zip_code: cep },
        items: body.items || [{ weight_kg: 1.0, length_cm: 30, height_cm: 12, width_cm: 20 }]
      };
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(payload)
      });
      const data = await r.json();
      // Map MelhorEnvio response to our format. The exact fields depend on the API response.
      if(data && data.options && Array.isArray(data.options)){
        const options = data.options.map(o => ({
          provider: o.provider_name || o.provider || 'MelhorEnvio',
          service: o.service_name || o.service,
          price: o.price || o.value || 0,
          estimate: o.estimate || o.delivery_time || ''
        }));
        return res.json({options});
      }
      // fallback if response shape different
      if(data && data.length && Array.isArray(data)){
        const options = data.map(o=>({ provider: o.provider_name || o.provider, service: o.service_name||o.service, price: o.price||0, estimate: o.estimate||'' }));
        return res.json({options});
      }
      // default fallback
      return res.json({options:[{provider:'MelhorEnvio',service:'PAC',price:19.90,estimate:'3-7 dias úteis'}]});
    }

    // No token: simulate by deriving from CEP first digit
    const first = Number(cep[0]);
    let option;
    if(first <= 2) option = {provider:'Correios',service:'SEDEX',price:29.90,estimate:'1-3 dias úteis'};
    else if(first <= 5) option = {provider:'Correios',service:'PAC',price:19.90,estimate:'3-7 dias úteis'};
    else option = {provider:'Correios',service:'PAC',price:24.90,estimate:'5-12 dias úteis'};
    return res.json({options:[option]});
  } catch(err){
    console.error('Frete error', err);
    return res.status(500).json({message:'Erro ao calcular frete'});
  }
});

app.listen(PORT, ()=> console.log('HypeFeet server listening on', PORT));
