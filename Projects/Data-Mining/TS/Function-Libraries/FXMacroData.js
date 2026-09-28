exports.newDataMiningFunctionLibrariesFXMacroData = function () {
    const DEFAULT_BASE_URL = 'https://api.fxmacrodata.com/v1/'

    let thisObject = {
        buildUrl: buildUrl,
        requestHeaders: requestHeaders,
        dataCatalogue: dataCatalogue,
        announcements: announcements,
        latestAnnouncements: latestAnnouncements,
        calendar: calendar,
        predictions: predictions,
        forex: forex,
        cot: cot,
        commodity: commodity,
        commoditiesLatest: commoditiesLatest,
        marketSessions: marketSessions,
        riskSentiment: riskSentiment,
        pressReleases: pressReleases
    }

    return thisObject

    /*
    History endpoints (announcements, predictions, forex, cot, commodities,
    risk sentiment) return 20 rows by default and at most 100 per request,
    newest first. Pass { limit: 100, offset: n } in params and follow
    pagination.next_offset while pagination.has_more is true.
    The API key is sent as a header (see requestHeaders), never in the URL.
    */
    function buildUrl(path, params, baseUrl) {
        let url = new URL(path.replace(/^\/+/, ''), baseUrl || DEFAULT_BASE_URL)
        let queryParams = params || {}

        for (let key of Object.keys(queryParams)) {
            if (queryParams[key] !== undefined && queryParams[key] !== null) {
                url.searchParams.set(key, queryParams[key])
            }
        }

        return url.toString()
    }

    function requestHeaders(apiKey) {
        let headers = { Accept: 'application/json' }
        if (apiKey !== undefined && apiKey !== null && apiKey !== '') {
            headers['X-API-Key'] = apiKey
        }
        return headers
    }

    function dataCatalogue(currency, baseUrl) {
        return buildUrl(
            'data_catalogue/' + normalizeCurrency(currency),
            undefined,
            baseUrl
        )
    }

    function announcements(currency, indicator, params, baseUrl) {
        return buildUrl(
            'announcements/' + normalizeCurrency(currency) + '/' + indicator,
            params,
            baseUrl
        )
    }

    function latestAnnouncements(currency, params, baseUrl) {
        return buildUrl(
            'announcements/' + normalizeCurrency(currency) + '/latest',
            params,
            baseUrl
        )
    }

    function calendar(currency, params, baseUrl) {
        return buildUrl(
            'calendar/' + normalizeCurrency(currency),
            params,
            baseUrl
        )
    }

    function predictions(currency, indicator, params, baseUrl) {
        return buildUrl(
            'predictions/' + normalizeCurrency(currency) + '/' + indicator,
            params,
            baseUrl
        )
    }

    function forex(base, quote, params, baseUrl) {
        return buildUrl(
            'forex/' + normalizeCurrency(base) + '/' + normalizeCurrency(quote),
            params,
            baseUrl
        )
    }

    function cot(currency, params, baseUrl) {
        return buildUrl(
            'cot/' + normalizeCurrency(currency),
            params,
            baseUrl
        )
    }

    function commodity(indicator, params, baseUrl) {
        return buildUrl('commodities/' + indicator, params, baseUrl)
    }

    function commoditiesLatest(params, baseUrl) {
        return buildUrl('commodities/latest', params, baseUrl)
    }

    function marketSessions(params, baseUrl) {
        return buildUrl('market_sessions', params, baseUrl)
    }

    function riskSentiment(params, baseUrl) {
        return buildUrl('risk_sentiment', params, baseUrl)
    }

    function pressReleases(currency, params, baseUrl) {
        return buildUrl(
            'press-releases/' + normalizeCurrency(currency),
            params,
            baseUrl
        )
    }

    function normalizeCurrency(currency) {
        return String(currency).trim().toLowerCase()
    }
}
