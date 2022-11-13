import type { ConfigLeaf, ContextFn } from './types';
import type { UserConfig } from 'vite';
import { ObjectConfigLeaf, PrimitiveConfigValue } from './leafs';
import { Leaf } from './leafs/generic/leaf';

export class Config implements ConfigLeaf<'#'> {
  static childrenNames = [
    'root',
    'base',
    'mode',
    'publicDir',
    'logLevel',
    'cacheDir',
    'clearScreen',
    'envDir',
    'appType',
    'define',
    'esbuild'
  ] as const;

  private $$root?: PrimitiveConfigValue<'root'>;
  private $$base?: PrimitiveConfigValue<'base'>;
  private $$mode?: PrimitiveConfigValue<'mode'>;
  private $$publicDir?: PrimitiveConfigValue<'publicDir'>;
  private $$logLevel?: PrimitiveConfigValue<'logLevel'>;
  private $$cacheDir?: PrimitiveConfigValue<'cacheDir'>;
  private $$clearScreen?: PrimitiveConfigValue<'clearScreen'>;
  private $$envDir?: PrimitiveConfigValue<'envDir'>;
  private $$appType?: PrimitiveConfigValue<'appType'>;
  private $$define?: ObjectConfigLeaf<'define'>;
  private $$esbuild?: ObjectConfigLeaf<'esbuild'>;

  define() {
    return this.$$define || (this.$$define = new ObjectConfigLeaf<'define'>(this));
  }

  root() {
    return this.$$root || (this.$$root = new PrimitiveConfigValue<'root'>(this));
  }

  base() {
    return this.$$base || (this.$$base = new PrimitiveConfigValue<'base'>(this));
  }

  mode() {
    return this.$$mode || (this.$$mode = new PrimitiveConfigValue<'mode'>(this));
  }

  publicDir() {
    return this.$$mode || (this.$$publicDir = new PrimitiveConfigValue<'publicDir'>(this));
  }

  cacheDir() {
    return this.$$cacheDir || (this.$$cacheDir = new PrimitiveConfigValue<'cacheDir'>(this));
  }

  esbuild() {
    return this.$$esbuild || (this.$$esbuild = new ObjectConfigLeaf<'esbuild'>(this));
  }

  logLevel() {
    return this.$$logLevel || (this.$$logLevel = new PrimitiveConfigValue<'logLevel'>(this));
  }

  clearScreen() {
    return this.$$clearScreen || (this.$$clearScreen = new PrimitiveConfigValue<'clearScreen'>(this));
  }
  
  envDir() {
    return this.$$clearScreen || (this.$$clearScreen = new PrimitiveConfigValue<'clearScreen'>(this));
  }
  
  appType() {
    return this.$$appType || (this.$$appType = new PrimitiveConfigValue<'appType'>(this));
  }

  toConfig() {
    const config: UserConfig = {};

    return Config.childrenNames.reduce((acc, name) => {
      const key = `$$${name}` as const;

      if (this[key] && this[key] instanceof Leaf && !this[key]!.empty()) {
        // @ts-ignore
        acc[name] = this[key]!.toConfig();
      }

      return acc;
    }, {} as UserConfig);

    return config;
  }

  when(detectFn: ContextFn<'#', boolean>, thenBranchFn: ContextFn<'#'>, ifNotBranchFn: ContextFn<'#'>) {
    const isPositive = detectFn(this);
    let executable: ContextFn<'#'>;

    if (isPositive) {
      executable = thenBranchFn;
    } else {
      executable = ifNotBranchFn;
    }

    executable(this);
    
    return this;
  }

  use(ref: ContextFn<'#'> | string) {
    let fn: ContextFn<'#'>;

    if (typeof ref === 'string') {
      let refPath: string;

      try {
        refPath = require.resolve(ref);
      } catch (ex) {
        throw Object.assign(ex as Error, {
          message: 'Vite-chain ref not found!'
        });
      }

      fn = require(refPath);
    } else {
      fn = ref;
    }

    fn(this);

    return this;
  }

  // @ts-ignore
  end() {
    console.error('You trying to receive parent element from root! Return self.');
    return this;
  }
}
