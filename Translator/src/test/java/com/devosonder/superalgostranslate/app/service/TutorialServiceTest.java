package com.devosonder.superalgostranslate.app.service;

import com.devosonder.deepltranslator.TargetLanguage;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TutorialServiceTest {

    private final TutorialService tutorialService = new TutorialService();

    @Test
    void translate() {
        var targetLanguage = TargetLanguage.TURKISH;
        String translate = tutorialService.translate("D:\\Projeler\\SuperalgosTranslate\\src\\main\\resources\\data", targetLanguage);
        assertEquals("Tutorial", translate);
    }
}
