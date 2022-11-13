import type { UserConfig } from 'vite';
import type { Get } from 'type-fest/source/get';
import type { ConfigObject, ConfigValue } from '../../types';
import { Leaf } from './leaf';
import { Config } from '../../Config';

export class ObjectConfigLeaf<Path extends string> extends Leaf<Path> implements ConfigObject<Path> {
  private values: Map<keyof ConfigValue<Path>, ConfigValue<Path>[keyof ConfigValue<Path>]>;

  constructor(parent: Config) {
    // @ts-ignore
    super(parent);
    this.values = new Map();
  }

  empty() {
    return this.values.size === 0;
  }

  size() {
    return this.values.size;
  }

  keys() {
    return Array.from(this.values.keys()) as (keyof NonNullable<Get<UserConfig, Path>>)[];
  }

  get(key: keyof ConfigValue<Path>) {
    return this.values.get(key);
  }

  set(key: keyof NonNullable<Get<UserConfig, Path>>, value: any) {
    this.values.set(key, value);
    return this;
  }

  toConfig() {
    const configLeaf: Partial<ConfigValue<Path>> = {};

    for (const [key, value] of this.values) {
      configLeaf[key] = value;
    }
    
    return configLeaf as Readonly<ConfigValue<Path>>;
  }
}
