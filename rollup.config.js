import pkg from './package.json';
import rollupPlugins from '../../rollup.config.js'

export default {
 input: pkg.source,
 output: rollupPlugins.output(pkg),
 plugins: rollupPlugins.plugins
};