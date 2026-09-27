import { defineConfig } from 'vite';
import { imageDirectory, syncProductImages } from './scripts/sync-product-images.mjs';
import { relative, isAbsolute } from 'node:path';

export default defineConfig({
  plugins: [{
    name: 'bem-casados-photo-manifest',
    buildStart() { syncProductImages(); },
    configureServer(server) {
      server.watcher.add(imageDirectory);
      const refresh = path => {
        const local = relative(imageDirectory, path);
        if (local && !local.startsWith('..') && !isAbsolute(local)) syncProductImages();
      };
      server.watcher.on('add', refresh).on('unlink', refresh);
      server.httpServer?.once('close', () => {
        server.watcher.off('add', refresh).off('unlink', refresh);
      });
    }
  }]
});
