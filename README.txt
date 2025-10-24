Hype Feet — Site com cálculo de frete real (MelhorEnvio)
-------------------------------------------------------

Arquivos:
- index.html         -> Frontend (home + modal produto + checkout)
- server.js          -> Backend Express com /api/frete (preparado para MelhorEnvio)
- package.json       -> Dependências
- .env.example       -> Exemplo de variáveis de ambiente

Como usar (local):
1) Copie .env.example para .env e preencha MELHOR_ENVIO_TOKEN e SENDER_CEP.
2) Instale dependências: npm install
3) Rode o servidor: npm start
4) Abra http://localhost:3000/index.html em seu navegador (ou configure server to serve index).

MelhorEnvio:
- A API exige token (Bearer). Use sua conta MelhorEnvio para gerar token.
- Verifique a documentação oficial para o endpoint correto e payload: https://docs.melhorenvio.com.br

Notas:
- O frontend chama POST /api/frete com { cep_destino, items: [{weight_kg, length_cm, height_cm, width_cm}] }.
- O backend, se não encontrar MELHOR_ENVIO_TOKEN, retorna cotações simuladas (útil para testes offline).

Se quiser, eu já posso implementar também:
- Compra automática de etiqueta via MelhorEnvio (fluxo pós-pagamento).
- Integração Mercado Pago para pagamentos reais.
- Deploy automático (Render/Vercel) - eu te passo o passo a passo.
