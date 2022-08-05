package com.devosonder.superalgostranslate.app.factory;

import com.devosonder.deepltranslator.DeepLConfiguration;
import com.devosonder.deepltranslator.DeepLTranslator;

public class TranslatorFactory {
    public static DeepLTranslator getTranslator() {
        DeepLConfiguration deepLConfiguration = new DeepLConfiguration.Builder()
                .setRepetitions(0)
                .build();
        return new DeepLTranslator(deepLConfiguration);
    }
}
