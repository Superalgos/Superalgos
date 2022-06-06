package com.devosonder.deepltranslator;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public enum TargetLanguage {

    BULGARIAN("bg-BG", "translator-lang-option-bg-BG", "BG"),
    CHINESE_SIMPLIFIED("zh-ZH", "translator-lang-option-zh-ZH", "ZH"),
    CZECH("cs-CS", "translator-lang-option-cs-CS", "CS"),
    DANISH("da-DA", "translator-lang-option-da-DA", "DA"),
    DUTCH("nl-NL", "translator-lang-option-nl-NL", "NL"),
    ENGLISH_AMERICAN("en-US", "translator-lang-option-en-US", "EN"),
    ENGLISH_BRITISH("en-GB", "translator-lang-option-en-GB", "EN"),
    ESTONIAN("et-ET", "translator-lang-option-et-ET", "ET"),
    FINNISH("fi-FI", "translator-lang-option-fi-FI", "FI"),
    FRENCH("fr-FR", "translator-lang-option-fr-FR", "FR"),
    GERMAN("de-DE", "translator-lang-option-de-DE", "DE"),
    GREEK("el-EL", "translator-lang-option-el-EL", "EL"),
    HUNGARIAN("hu-HU", "translator-lang-option-hu-HU", "HU"),
    ITALIAN("it-IT", "translator-lang-option-it-IT", "IT"),
    JAPANESE("ja-JA", "translator-lang-option-ja-JA", "JA"),
    LATVIAN("lv-LV", "translator-lang-option-lv-LV", "LV"),
    LITHUANIAN("lt-LT", "translator-lang-option-lt-LT", "LT"),
    POLISH("pl-PL", "translator-lang-option-pl-PL", "PL"),
    PORTUGUESE("pt-PT", "translator-lang-option-pt-PT", "PT"),
    PORTUGUESE_BRAZILIAN("pt-BR", "translator-lang-option-pt-BR", "PT"),
    ROMANIAN("ro-RO", "translator-lang-option-ro-RO", "RO"),
    RUSSIAN("ru-RU", "translator-lang-option-ru-RU", "RU"),
    SLOVAK("sk-SK", "translator-lang-option-sk-SK", "SK"),
    SLOVENIAN("sl-SL", "translator-lang-option-sl-SL", "SL"),
    SPANISH("es-ES", "translator-lang-option-es-ES", "ES"),
    SWEDISH("sv-SV", "translator-lang-option-sv-SV", "SV"),
    TURKISH("tr-TR", "translator-lang-option-tr-TR", "TR");

    private static Map<String, TargetLanguage> codeToLanguage;
    private final String languageCode;

    private final String shortLanguageCode;
    private final String attributeValue;

    static {
        Map<String, TargetLanguage> codeToLanguage = new HashMap<>();

        for (TargetLanguage language : TargetLanguage.values()) {
            codeToLanguage.put(language.getLanguageCode(), language);
        }

        TargetLanguage.codeToLanguage = codeToLanguage;
    }

    TargetLanguage(String languageCode, String attributeValue, String shortLanguageCode) {
        this.languageCode = languageCode;
        this.attributeValue = attributeValue;
        this.shortLanguageCode = shortLanguageCode;
    }

    /**
     * Returns the language code (ISO 639‑1 language code, hyphen, ISO-3166 country code – e.g. en-US).
     *
     * @return language code (ISO 639‑1 language code, hyphen, ISO-3166 country code – e.g. en-US)
     */
    public String getLanguageCode() {
        return languageCode;
    }

    public String getShortLanguageCode() {
        return shortLanguageCode;
    }

    /**
     * Returns the value of the attribute to identify the correct button.
     *
     * @return dl-test attribute value
     */
    String getAttributeValue() {
        return attributeValue;
    }

    /**
     * Returns the language from a specific language code (ISO 639‑1 language code, hyphen, ISO-3166 country code – e.g. en-US).
     *
     * @param languageCode language code (ISO 639‑1 language code, hyphen, ISO-3166 country code – e.g. en-US)
     * @return the language
     */
    public static Optional<TargetLanguage> getLanguage(String languageCode) {
        return Optional.ofNullable(codeToLanguage.get(languageCode));
    }
}
