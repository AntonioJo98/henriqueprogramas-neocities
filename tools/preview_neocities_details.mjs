import createApplicationConfig from 'file:///C:/Users/Antonio/AppData/Local/hermes/node/node_modules/async-neocities/node_modules/application-config/index.js';
import { NeocitiesAPIClient } from 'file:///C:/Users/Antonio/AppData/Local/hermes/node/node_modules/async-neocities/index.js';

const config = await createApplicationConfig('async-neocities').read();
const apiKey = config.henriqueprogramas;
if (!apiKey) throw new Error('No API key found for henriqueprogramas');

const client = new NeocitiesAPIClient(apiKey);
const diff = await client.previewDeploy({ directory: new URL('../site/', import.meta.url).pathname.replace(/^\/(.:)/, '$1') });

const names = (files) => files.map((file) => file.name ?? file.path ?? String(file)).sort();
console.log(JSON.stringify({
  upload: names(diff.filesToUpload),
  orphan: names(diff.filesToDelete),
  skip: names(diff.filesSkipped),
  unsupported: names(diff.unsupportedFiles),
  protected: names(diff.protectedFiles),
}, null, 2));
