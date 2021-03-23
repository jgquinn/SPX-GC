const fs = require( 'fs' );
const path = require( 'path' );
const { createProxyMiddleware } = require( 'http-proxy-middleware' );

module.exports = {
    configureProxies: function( expapp ) {
        var startUpPath = process.cwd();    // FIXME: subject to same Mac-specific behavior in Issue #3
        const proxyConfigFile = path.join( startUpPath, 'proxy.config.json' );
        if ( fs.existsSync( proxyConfigFile ) ) {
            const proxyConfig = JSON.parse( fs.readFileSync( proxyConfigFile ) );
            for ( entry of proxyConfig ) {
                expapp.use(
                    entry.path,
                    createProxyMiddleware({
                        target: entry.url,
                        changeOrigin: true,
                        pathRewrite: { [ '^' + entry.path ]: '' }
                    } ) );
            }
        }
    }
};
