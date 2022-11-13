import type { Get } from 'type-fest/source/get';
import type { UserConfig } from 'vite';
import type { ConfigPrimitive } from '../../types';
import { Config } from '../../Config';
import { Leaf } from './leaf';

export class PrimitiveConfigValue<Path extends string> extends Leaf<Path> implements ConfigPrimitive<Path> {
  value: NonNullable<Get<UserConfig, Path>> | undefined;

  constructor(parent: Config) {
    // @ts-ignore
    super(parent);
    this.value = undefined;
  }

  empty() {
    return Boolean(this.value) === false;
  }

  get() {
    return this.value;
  }

  set(value: typeof this.value) {
    this.value = value;
    return this;
  }

  remove() {
    this.value = undefined;
    return this;
  }
}
