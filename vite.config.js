import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { stylex } from 'vite-plugin-stylex-dev'
import { createHtmlPlugin } from 'vite-plugin-html'
import crypto from 'crypto'
import fs from 'fs'

function generateNonce() {
 return crypto.randomBytes(16).toString('base64');
}

function generateBuildId() {
 return crypto.randomBytes(8).toString('hex');
}

function generateVersionHash() {
 return crypto.createHash('sha256').update(Date.now().toString()).digest('hex').slice(0, 40);
}

export default defineConfig({
 plugins: [
  react(),
  stylex({
   classNamePrefix: 'u',
  }),
  nodePolyfills({
   globals: {
    Buffer: true,
    global: true,
    process: true,
   },
   protocolImports: true,
  }),
  createHtmlPlugin({
   minify: {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,
    sortAttributes: true,
    sortClassName: true
   },
   inject: {
    data: {
     injectScript: `<script nonce="${generateNonce()}">window.GLOBAL_ENV={"API_ENDPOINT":"https://api.uchat.xyz","BUILD_NUMBER":"${Date.now()}","PROJECT_ENV":"production","RELEASE_CHANNEL":"stable","VERSION_HASH":"${generateVersionHash()}","PRIMARY_DOMAIN":"uchat.xyz","SENTRY_TAGS":{"buildId":"${generateBuildId()}","buildType":"normal"},"SENTRY_RELEASE":"${generateVersionHash()}","PUBLIC_PATH":"/assets/","LOCATION":"us-east","API_VERSION":"9","API_PROTOCOL":"https://","API_ENDPOINT":"//api.uchat.xyz","GATEWAY_ENDPOINT":"wss://gateway.uchat.gg","STATIC_ENDPOINT":"//uchat.xyz","ASSET_ACCOUNT":"//account.uchat.xyz","PROV_DOMAIN":"//uchat.ufonic.xyz","MEDIA_PROXY_ENDPOINT":"uchat.ufonic.xyz","WIDGET_ENDPOINT":"//uchat.ufonic.xyz/widget","INVITE_HOST":"uchat.ufonic.xyz","GUILD_TEMPLATE_HOST":"uchat.ufonic.xyz","GIFT_CODE_HOST":"uchat.ufonic.xyz","ACTIVITY_APPLICATION_HOST":"uchat.ufonic.xyz","MIGRATION_SOURCE_ORIGIN":"https://uchat.ufonic.xyz","MIGRATION_DESTINATION_ORIGIN":"uchat.ufonic.xyz","HTML_TIMESTAMP":"${Date.now()}","ALGOLIA_KEY":"aca0d7082e4e63af5ba5917d5e96bed0","BRAINTREE_KEY":"production_ktzp8hfp_49pp2rp4phym7387","MUX_ENV_KEY":"undefined","DEV_SESSION_KEY":"undefined"}</script><script nonce="${generateNonce()}">window.__OVERLAY__=/overlay/.test(location.pathname);window.BILLING_STANDALONE=/\\/billing/.test(location.pathname);</script>`
    }
   }
  })
 ],
 assetsInclude: ['**/*.svg'],
 css: {
  modules: {
   generateScopedName:
    process.env.NODE_ENV === 'production'
     ? '_[hash:base64:8]_[hash:base64:8]_[hash:base64:8]'
     : '[name]__[local]__[hash:base64:3]',
  }
 },
 define: {
  global: 'globalThis',
  __dirname: JSON.stringify('/'),
 },
 resolve: {
  alias: {
   buffer: 'buffer',
   process: 'process/browser',
  }
 },
 optimizeDeps: {
  include: ['simple-peer'],
 },
 build: {
  outDir: 'dist-obfuscated',
  assetsDir: 'assets',
  minify: 'terser',
  terserOptions: {
   compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info'],
    passes: 2
   },
   mangle: {
    toplevel: true,
    safari10: true
   },
   format: {
    comments: false
   }
  },
  rollupOptions: {
   output: {
    assetFileNames: 'assets/[name]-[hash][extname]',
    chunkFileNames: 'assets/[name]-[hash].js',
    entryFileNames: 'assets/[name]-[hash].js',
    manualChunks: {
     vendor: ['react', 'react-dom', 'react-router-dom']
    }
   }
  }
 },
 server: {
  ...(process.env.NODE_ENV !== 'production' &&
   fs.existsSync('./192.168.1.48+3-key.pem') &&
   fs.existsSync('./192.168.1.48+3.pem')
   ? {
    https: {
     key: fs.readFileSync('./192.168.1.48+3-key.pem'),
     cert: fs.readFileSync('./192.168.1.48+3.pem'),
    },
   }
   : {}),
  host: '0.0.0.0',
  port: 5173,
 },
})