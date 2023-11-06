package com.devosonder.superalgostranslate.app.service;

import com.deepl.api.*;
import com.devosonder.superalgostranslate.app.factory.ObjectMaperFactory;
import com.devosonder.superalgostranslate.app.model.common.Paragraph;
import com.devosonder.superalgostranslate.app.model.common.Translation;
import com.devosonder.superalgostranslate.app.model.topic.Topic;
import com.devosonder.superalgostranslate.app.util.BlackListUtil;
import com.devosonder.superalgostranslate.app.util.FileUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.TimeoutException;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class TopicService {

    private final List<String> blackList = BlackListUtil.blackListStyleValues;
    private Translator translator = null;

    public void setTranslator(Translator translator) {
        this.translator = translator;
    }

    @SneakyThrows
    public void translate(String rootFolderName, String targetLanguage) {
        List<String> allFiles = FileUtil.getAllFiles(rootFolderName);
        try {
            for (String filePath : allFiles) {

                if (filePath.contains("_translated.json")) {
                    continue;
                }
                if (FileUtil.isTranslated(filePath)) {
                    System.out.println("File already translated: " + filePath);
                    continue;
                }
                System.out.println(filePath);
                ObjectMapper objectMapper = ObjectMaperFactory.getObjectMapper();

                Topic topic;
                try {
                    topic = objectMapper.readValue(new File(filePath), Topic.class);
                } catch (IOException e) {
                    System.out.println("Error File: " + filePath);
                    e.printStackTrace();
                    continue;
                }
                if (topic.getTopic() == null || topic.getTopic().isEmpty() || topic.getTopic().isBlank()) {
                    System.out.println("Tutorial is empty. Continuing to next file.");
                    continue;
                }
                boolean isEditedDefinition;
                boolean isEditedParagraph;


                isEditedDefinition = translateDefinition(topic, targetLanguage);
                isEditedParagraph = translateParagraphs(topic, targetLanguage);
                if (!isEditedDefinition && !isEditedParagraph) {
                    System.out.println("No translation found. Continuing to next file.");
                    continue;
                }
                File translatedFile = FileUtil.getTranslatedFile(filePath);
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(translatedFile, topic);
                Process kill = new ProcessBuilder(
                        "powershell.exe",
                        "Get-Process chromedriver | Where StartTime -lt (Get-Date).AddMinutes(-3) | Stop-Process -Force"
                ).start();
                kill.onExit().thenRun(() -> System.out.println("\n[OK] Killed chromedriver process...\n"));

            }
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private boolean translateParagraphs(Topic topic, String targetLanguage) {
        if (topic.getParagraphs() == null) {
            return false;
        }

        boolean isEdited = false;
        for (Paragraph paragraph : topic.getParagraphs()) {
            String paragraphText = null;
            String paragraphStyle = null;
            if (paragraph.getText() != null) {
                paragraphText = paragraph.getText();
            }
            if (paragraph.getStyle() != null) {
                paragraphStyle = paragraph.getStyle();
            }
            if (paragraphText == null || paragraphText.isBlank()) {
                continue;
            }
            if (paragraphStyle == null || blackList.contains(paragraphStyle)) {
                continue;
            }
            if (paragraph.getTranslations() == null) {
                paragraph.setTranslations(new ArrayList<>());
            }

            if (turkishTranslationExists(paragraph.getTranslations(), targetLanguage)) {
                continue;
            }

            Translation translation = new Translation();
            translation.setLanguage(targetLanguage);
            translation.setUpdated(Date.from(new Date().toInstant()).getTime());
            String translated;
            try {
                translated = (translator.translateText(paragraphText, "en", targetLanguage)).getText();
                isEdited = true;
            } catch (IllegalStateException | TimeoutException | SessionNotCreatedException | InterruptedException | DeepLException e) {
                e.printStackTrace();
                continue;
            }
            if (!paragraphText.endsWith("\n")) {
                translated = translated.trim();
            }
            System.out.println("Original: " + paragraphText);
            System.out.println("Translated: " + translated);
            translation.setText(translated);
            translation.setStyle(paragraphStyle);
            paragraph.getTranslations().add(translation);
        }


        return isEdited;
    }

    private boolean translateDefinition(Topic topic, String targetLanguage) {
        if (topic.getDefinition() == null) {
            return false;
        }
        String definitionText = null;
        if (topic.getDefinition().getText() != null) {
            definitionText = topic.getDefinition().getText();
        }
        if (definitionText == null) {
            return false;
        }
        if (topic.getDefinition().getTranslations() == null) {
            topic.getDefinition().setTranslations(new ArrayList<>());
        }

        if (turkishTranslationExists(topic.getDefinition().getTranslations(), targetLanguage)) {
            return false;
        }

        Translation translation = new Translation();
        translation.setLanguage(targetLanguage);
        translation.setUpdated(Date.from(new Date().toInstant()).getTime());
        String translated;
        try {
            translated = (translator.translateText(definitionText, "en", targetLanguage)).getText();
        } catch (IllegalStateException | TimeoutException | InterruptedException | DeepLException e) {
            return false;
        }
        if (!definitionText.endsWith("\n")) {
            translated = translated.trim();
        }
        System.out.println("Original: " + definitionText);
        System.out.println("Translated: " + translated);
        translation.setText(translated);
        topic.getDefinition().getTranslations().add(translation);


        return true;
    }

    private boolean turkishTranslationExists(ArrayList<Translation> translations, String targetLanguage) {
        for (Translation translation : translations) {
            if (translation.language.equals(targetLanguage)) {
                return true;
            }
        }
        return false;
    }
}
