import type { UserConfig } from 'vite';
import type { Get } from 'type-fest/source/get';
import type { Split } from 'type-fest/source/split';
import type { Join } from 'type-fest/source/join';
import type { Config } from './Config';
import type { Leaf, PrimitiveConfigValue, ObjectConfigLeaf } from './leafs';

interface PathMapping {
  root: PrimitiveConfigValue<'root'>;
  base: PrimitiveConfigValue<'base'>;
  mode: PrimitiveConfigValue<'mode'>;
  publicDir: PrimitiveConfigValue<'publicDir'>;
  logLevel: PrimitiveConfigValue<'logLevel'>;
  cacheDir: PrimitiveConfigValue<'cacheDir'>;
  clearScreen: PrimitiveConfigValue<'clearScreen'>;
  envDir: PrimitiveConfigValue<'envDir'>;
  appType: PrimitiveConfigValue<'appType'>;
  define: ObjectConfigLeaf<'define'>;
  esbuild: ObjectConfigLeaf<'esbuild'>;
  '#': Config
};

export type LeafWithPath<Path extends string> =
  Path extends keyof PathMapping
    ? PathMapping[Path]
    : never
;

export type ConfigValue<Path extends string> = NonNullable<Get<UserConfig, Path>>;
export type Setter<Path extends string> = ConfigValue<Path>[keyof ConfigValue<Path>] | undefined;
type ExcludeLast<T> = T extends [...rest: infer R, last: unknown] ? R : [];
type GetCurrent<Path extends string> = Path extends '#' ? UserConfig : Get<UserConfig, Path>;
export type GetParentPath<Path extends string> = 
  ExcludeLast<Split<Path, '.'>> extends ''
    ? '#'
    : Join<ExcludeLast<Split<Path, '.'>>, '.'>
;
type GetParent<Path extends string> = Path extends '#' ? UserConfig : Get<UserConfig, GetParentPath<Path>>;
export type Current<Path extends string> = LeafWithPath<Path>;
export type Parent<Path extends string> = LeafWithPath<GetParentPath<Path>>;

export type ParentTree<Path extends string, Buffer extends Array<any>= []> =
  Path extends '#'
    ? UserConfig
    : GetParentPath<Path>['length'] extends 0
      ? [...Buffer, ConfigLeaf<Path>]
      : ParentTree<GetParentPath<Path>, [...Buffer, ConfigLeaf<Path>]>
;
export type ValueOfCurrent<Path extends string> =
  GetCurrent<Path> extends Array<unknown>
    ? GetCurrent<Path>[number]
    : GetCurrent<Path>[keyof GetCurrent<Path>]
;
export type DiscoverFn<Path extends string> = (
  element: GetCurrent<Path>[keyof GetCurrent<Path>],
  idx: keyof GetCurrent<Path>,
  parent: GetParent<Path>,
  root: UserConfig
) => boolean;

export type ContextFn<Path extends string, Res = GetCurrent<Path>> = 
  Path extends '#'
    ? (root: Config) => Res
    : (element: GetCurrent<Path>) => Res
; 

export interface ConfigLeaf<Path extends string = '#'> {
  toConfig(): Readonly<ConfigValue<Path>> | undefined;
  end(): ConfigLeaf<GetParentPath<Path>>;
  when(fn: ContextFn<Path, boolean>, then?: ContextFn<Path>, ifNot?: ContextFn<Path>): this | Promise<this>;
  use(fn: ContextFn<Path> | string): this;
}

export interface ConfigObject<Path extends string> extends ConfigLeaf<Path> {
  empty(): boolean;
  keys(): (keyof ConfigValue<Path>)[];
  size(): number;
  get(key: keyof ConfigValue<Path>): ConfigValue<Path>[keyof ConfigValue<Path>] | undefined;
  set(
    key: keyof ConfigValue<Path>,
    value: ConfigValue<Path>[keyof ConfigValue<Path>] | undefined
  ): this;
}

export interface ConfigArray<Path extends string> extends ConfigLeaf<Path> {
  empty(): boolean;
  size(): number;
  get(idx: number): GetCurrent<Path> extends [] ? GetCurrent<Path>[number] : never;
  add(value: GetCurrent<Path> extends [] ? GetCurrent<Path>[number] : never): this;
  clear(): this;
  removeAt(idx: number): this;
  replaceAt(idx: number, value: ValueOfCurrent<Path>): this;
  removeBy(fn: DiscoverFn<Path>): this;
  removeFirstBy(fn: DiscoverFn<Path>): this;
  replaceBy(fn: DiscoverFn<Path>, value: ValueOfCurrent<Path>): this;
  replaceFirstBy(fn: DiscoverFn<Path>, value: ValueOfCurrent<Path>): this;
}

export interface ConfigPrimitive<Path extends string> extends ConfigLeaf<Path> {
  empty(): boolean;
  remove(): this;
  get(): ConfigValue<Path> | undefined;
  set(value: ConfigValue<Path> | undefined): this;
}
