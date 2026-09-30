import { existsSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SOURCE_EXTS = ['.ts', '.tsx', '.mjs', '.js'];

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND' || !context.parentURL) throw error;
    if (!specifier.startsWith('.') && !specifier.startsWith('/')) throw error;

    const parentDir = dirname(fileURLToPath(context.parentURL));
    const absolute = specifier.startsWith('/') ? specifier : join(parentDir, specifier);
    const candidates = extname(absolute) ? [absolute] : SOURCE_EXTS.map((ext) => absolute + ext);

    for (const candidate of candidates) {
      if (!existsSync(candidate)) continue;
      return { url: pathToFileURL(candidate).href, shortCircuit: true };
    }
    throw error;
  }
}
