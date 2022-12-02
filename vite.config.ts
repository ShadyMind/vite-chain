import { Config } from './src';

export default () => {
  
  return new Config()
    .appType()
      .set('spa')
      .end()
    .toConfig();
};
