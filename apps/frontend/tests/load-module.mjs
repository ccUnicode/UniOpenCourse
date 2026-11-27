import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

export const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

/** Loads TypeScript modules with a fresh HTTP/storage environment per test. */
export function createModules({
  server = false,
  respond = () => Response.json({}),
  env = {},
} = {}) {
  const calls = [];
  const storage = new Map();
  const cache = new Map();
  const globals = {
    Headers,
    FormData,
    Response,
    URL,
    URLSearchParams,
    console,
    process: { env: { NEXT_PUBLIC_API_URL: 'https://public.example.test', ...env } },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return respond(url, options);
    },
    localStorage: {
      setItem: (key, value) => storage.set(key, value),
      getItem: (key) => storage.get(key) ?? null,
      removeItem: (key) => storage.delete(key),
    },
    ...(!server ? { window: {} } : {}),
  };
  function load(file) {
    const filename = path.resolve(
      frontendRoot,
      file.endsWith('.ts') ? file : `${file}.ts`,
    );
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    }).outputText;
    vm.runInNewContext(
      compiled,
      {
        ...globals,
        module: loadedModule,
        exports: loadedModule.exports,
        require: (specifier) =>
          load(
            specifier.startsWith('@/')
              ? specifier.slice(2)
              : path.relative(
                  frontendRoot,
                  path.resolve(path.dirname(filename), specifier),
                ),
          ),
      },
      { filename },
    );
    return loadedModule.exports;
  }
  return { load, calls, storage };
}
