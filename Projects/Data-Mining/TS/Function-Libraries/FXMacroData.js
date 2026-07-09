exports.newDataMiningFunctionLibrariesFXMacroData = function () {
    const DEFAULT_BASE_URL = 'https://fxmacrodata.com/api/v1/'

    let thisObject = {
        buildUrl: buildUrl,
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

    function buildUrl(path, params, apiKey, baseUrl) {
        let url = new URL(path.replace(/^\/+/, ''), baseUrl || DEFAULT_BASE_URL)
        let queryParams = params || {}

        for (let key of Object.keys(queryParams)) {
            if (queryParams[key] !== undefined && queryParams[key] !== null) {
                url.searchParams.set(key, queryParams[key])
            }
        }

        if (apiKey !== undefined && apiKey !== '') {
            url.searchParams.set('api_key', apiKey)
        }

        return url.toString()
    }

    function dataCatalogue(currency, apiKey, baseUrl) {
        return buildUrl(
            'data_catalogue/' + normalizeCurrency(currency),
            undefined,
            apiKey,
            baseUrl
        )
    }

    function announcements(currency, indicator, params, apiKey, baseUrl) {
        return buildUrl(
            'announcements/' + normalizeCurrency(currency) + '/' + indicator,
            params,
            apiKey,
            baseUrl
        )
    }

    function latestAnnouncements(currency, params, apiKey, baseUrl) {
        return buildUrl(
            'announcements/' + normalizeCurrency(currency) + '/latest',
            params,
            apiKey,
            baseUrl
        )
    }

    function calendar(currency, params, apiKey, baseUrl) {
        return buildUrl(
            'calendar/' + normalizeCurrency(currency),
            params,
            apiKey,
            baseUrl
        )
    }

    function predictions(currency, indicator, params, apiKey, baseUrl) {
        return buildUrl(
            'predictions/' + normalizeCurrency(currency) + '/' + indicator,
            params,
            apiKey,
            baseUrl
        )
    }

    function forex(base, quote, params, apiKey, baseUrl) {
        return buildUrl(
            'forex/' + normalizeCurrency(base) + '/' + normalizeCurrency(quote),
            params,
            apiKey,
            baseUrl
        )
    }

    function cot(currency, params, apiKey, baseUrl) {
        return buildUrl(
            'cot/' + normalizeCurrency(currency),
            params,
            apiKey,
            baseUrl
        )
    }

    function commodity(indicator, params, apiKey, baseUrl) {
        return buildUrl('commodities/' + indicator, params, apiKey, baseUrl)
    }

    function commoditiesLatest(params, apiKey, baseUrl) {
        return buildUrl('commodities/latest', params, apiKey, baseUrl)
    }

    function marketSessions(params, apiKey, baseUrl) {
        return buildUrl('market_sessions', params, apiKey, baseUrl)
    }

    function riskSentiment(params, apiKey, baseUrl) {
        return buildUrl('risk_sentiment', params, apiKey, baseUrl)
    }

    function pressReleases(currency, params, apiKey, baseUrl) {
        return buildUrl(
            'press-releases/' + normalizeCurrency(currency),
            params,
            apiKey,
            baseUrl
        )
    }

    function normalizeCurrency(currency) {
        return String(currency).trim().toLowerCase()
    }
}
