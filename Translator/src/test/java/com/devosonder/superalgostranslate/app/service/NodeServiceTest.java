package com.devosonder.superalgostranslate.app.service;

import com.devosonder.deepltranslator.TargetLanguage;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class NodeServiceTest {

    private final NodeService nodeService = new NodeService();

    @Test
    void translate() {
        var targetLanguage = TargetLanguage.TURKISH;
        String translate = nodeService.translate("D:\\Projeler\\Superalgos\\Projects\\Portfolio-Management\\Schemas\\Docs-Nodes", targetLanguage);
        assertEquals("Node", translate);
    }
}
