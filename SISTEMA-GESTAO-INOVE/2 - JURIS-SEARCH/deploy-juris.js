// Deploy: copia arquivos modificados para o VPS e reinicia o app
const path = require('path');
const fs   = require('fs');

const { Client } = require('./node_modules/ssh2');

const CONN = {
  host:     '129.121.39.150',
  port:     22022,
  username: 'root',
  password: 'Gcj2026admin!',
};

const LOCAL_BASE  = 'y:\\SANDRA\\juris-search';
const REMOTE_BASE = '/var/www/juris-search';

const ARQUIVOS = [
  'modulos/agendador.js',
  'modulos/scraper.js',
  'server.js',
  'public/index.html',
];

function sftp_put(sftp, local, remote) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, (err) => err ? reject(err) : resolve());
  });
}

async function deploy() {
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(CONN);
  });

  console.log('SSH conectado.');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => err ? reject(err) : resolve(s));
  });

  for (const rel of ARQUIVOS) {
    const local  = path.join(LOCAL_BASE, rel);
    const remote = `${REMOTE_BASE}/${rel}`;
    process.stdout.write(`  → ${rel} ... `);
    await sftp_put(sftp, local, remote);
    console.log('ok');
  }

  sftp.end();

  // Reinicia o PM2
  await new Promise((resolve, reject) => {
    conn.exec('pm2 restart gcj-juris-search', (err, stream) => {
      if (err) return reject(err);
      stream.on('close', resolve).on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stderr.write(d.toString()));
    });
  });

  console.log('\n✅ Deploy concluído!');
  conn.end();
}

deploy().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
