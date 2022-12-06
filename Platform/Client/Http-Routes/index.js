/**
 * 
 * @returns Map<string, ({}, {}) => void>
 */
exports.newHttpRoutes = function newHttpRoutes() {
    const routeMap = new Map()
    addRoutes()
    return routeMap

    function addRoutes() {
        const routes = [
            require('./bitcoin-factory').newBitCoinFactoryRoute(),
            require('./ccxt').newCCXTRoute(),
            require('./environment').newEnvironmentRoute(),
        ]

        routes.forEach(r => routeMap.set(r.endpoint, r.command))
    }
}