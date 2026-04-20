module.exports = (api) => {
    api.cache(true)
    const nativewindPlugins = require('./node_modules/react-native-css-interop/babel')()
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ...nativewindPlugins.plugins,
        ],
    }
}