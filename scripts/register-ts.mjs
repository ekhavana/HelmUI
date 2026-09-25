import { register } from 'node:module';

register(new URL('./ts-ext-loader.mjs', import.meta.url));
