package com.devosonder.superalgostranslate.app.factory;

import com.devosonder.superalgostranslate.app.config.SuparalgosDefaultIndenter;
import com.devosonder.superalgostranslate.app.config.SuperalgosDefaultPrettyPrinter;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ObjectMaperFactory {
    public static ObjectMapper getObjectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        SuperalgosDefaultPrettyPrinter prettyPrinter = new SuperalgosDefaultPrettyPrinter().withSpacesInObjectEntries();
        prettyPrinter.indentObjectsWith(new SuparalgosDefaultIndenter("    ", SuparalgosDefaultIndenter.SYS_LF));
        prettyPrinter.indentArraysWith(new SuparalgosDefaultIndenter("    ", "\n"));
        objectMapper.setDefaultPrettyPrinter(prettyPrinter);
        return objectMapper;
    }
}
