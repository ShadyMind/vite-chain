import type { Get } from 'type-fest/source/get';
import type { UserConfig } from 'vite';
import type { ConfigLeaf, GetParentPath, ContextFn, ConfigValue } from '../../types';

export class Leaf<Path extends string> implements ConfigLeaf<Path> {
  private readonly parent: ConfigLeaf<GetParentPath<Path>>;
  private leafList: ConfigLeaf<
    Path extends '#'
      ? keyof UserConfig
      : `${Path}.${string}`
  >[];

  constructor(parent: ConfigLeaf<GetParentPath<Path>>) {
    this.leafList = [];
    this.parent = parent;
  }

  toConfig(): Readonly<ConfigValue<Path>> {
    return this.leafList.reduce(
      (acc, leaf) => Object.assign(acc, leaf.toConfig()),
      {} as Get<UserConfig, Path>
    );
  }

  end() {
    return this.parent;
  }

  when(detectFn: ContextFn<Path, boolean>, thenBranchFn: ContextFn<Path>, ifNotBranchFn: ContextFn<Path>) {
    const config = this.toConfig();
    const isPositive = detectFn(config);
    let executable: ContextFn<Path>;

    if (isPositive) {
      executable = thenBranchFn;
    } else {
      executable = ifNotBranchFn;
    }
    
    return this;
  }

  use(ref: ContextFn<Path> | string) {
    let fn: ContextFn<Path>;

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

    fn(this.toConfig());

    return this;

  }
}
