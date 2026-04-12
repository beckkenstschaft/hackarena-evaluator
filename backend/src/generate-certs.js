import devcert from 'devcert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certPath = path.join(__dirname, '..', 'certificates');

async function generateCerts() {
  if (!fs.existsSync(certPath)) {
    fs.mkdirSync(certPath, { recursive: true });
  }

  console.log('Generating SSL certificates...');
  
  try {
    const { key, cert } = await devcert.certificateFor('localhost');
    
    fs.writeFileSync(path.join(certPath, 'server.key'), key);
    fs.writeFileSync(path.join(certPath, 'server.crt'), cert);
    
    console.log('SSL certificates generated successfully!');
    console.log(`Location: ${certPath}`);
    console.log('Files created:');
    console.log('  - server.key (private key)');
    console.log('  - server.crt (certificate)');
    console.log('\nNote: This is a self-signed certificate.');
    console.log('Browser will show security warning - click "Advanced" to proceed to localhost.');
  } catch (err) {
    console.error('Error generating certificates:', err.message);
    console.log('\nFalling back to manual certificate generation...');
    
    const { generateKeyPairSync } = await import('crypto');
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    
    fs.writeFileSync(path.join(certPath, 'server.key'), privateKeyPem);
    console.log('Private key generated. Certificate needs to be generated manually.');
  }
}

generateCerts();
