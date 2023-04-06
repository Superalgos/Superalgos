package com.devosonder.superalgostranslate.app.config;

import com.deepl.api.*;
import com.devosonder.superalgostranslate.app.factory.TranslatorFactory;
import com.devosonder.superalgostranslate.app.service.*;
import com.devosonder.superalgostranslate.app.util.FileUtil;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class TranslatorRunBean {
    private final NodeService nodeService = new NodeService();
    private final TutorialService tutorialService = new TutorialService();
    private final ReviewService reviewService = new ReviewService();
    private final TopicService topicService = new TopicService();
    private final ChangeFileNamesService changeFileNamesService = new ChangeFileNamesService();

    @SneakyThrows
    public void run(String[] args) {
        Translator translator = new Translator("e6ec7277-1288-6ac3-3451-db77c52900b0:fx");
        List<GlossaryLanguagePair> glossaryLanguages = translator.getGlossaryLanguages();

        if (args.length == 2 && args[1].equals("apply-translations")) {
            var dir = args[0];
            changeFileNamesService.change(dir);
            System.exit(0);
        } else if (args.length < 2) {
            System.out.println("Syntax:");
            System.out.println("java -jar translator.jar <root folder> <language code>");
            System.out.println("Set <language code> to one of the following:");
            String sourceLanguage = "en";
            for (GlossaryLanguagePair glossaryLanguage : glossaryLanguages) {
                if (!sourceLanguage.equals(glossaryLanguage.getSourceLanguage())) {
                    continue;
                }
                System.out.printf("%s\n", glossaryLanguage.getTargetLanguage());
            }
            System.exit(1);
        }
        var dir = args[0];
        String targetLanguage = args[1];

        System.out.println("Translating from: " + dir);

        System.out.println("[  ] Looking for folders for translation...");
        List<String> allDirectories = FileUtil.getAllDirectories(dir);
        System.out.println("[OK] Looking for folders for translation...");
        System.out.println("[  ] Translate starting. Please wait...");
        nodeService.setTranslator(translator);
        tutorialService.setTranslator(translator);
        topicService.setTranslator(translator);
        reviewService.setTranslator(translator);
        try {
            for (String directory : allDirectories) {
                try {
                    if (directory == null || directory.isEmpty()) {
                        continue;
                    }
                    if (directory.endsWith("Docs-Nodes") || directory.endsWith("Docs-Concepts") ||
                            directory.endsWith("Docs-Space-Settings") || directory.endsWith("Docs-Space-Style")) {
                        nodeService.translate(directory, targetLanguage);
                    } else if (directory.endsWith("Docs-Tutorials")) {
                        tutorialService.translate(directory, targetLanguage);
                    } else if (directory.endsWith("Docs-Reviews")) {
                        reviewService.translate(directory, targetLanguage);
                    } else if (directory.endsWith("Docs-Topics") || directory.endsWith("Docs-Basics") ||
                            directory.endsWith("Docs-Commands") || directory.endsWith("Docs-Commands-Errors") ||
                            directory.endsWith("Docs-Commands-Messages") || directory.endsWith("Docs-Context-Menu-Actions") ||
                            directory.endsWith("Docs-Languages") || directory.endsWith("Docs-Paragraph-Styles")) {
                        topicService.translate(directory, targetLanguage);
                    }
                    Process kill = new ProcessBuilder(
                            "powershell.exe",
                            "Get-Process chromedriver | Where StartTime -lt (Get-Date).AddMinutes(-1) | Stop-Process -Force"
                    ).start();
                    kill.onExit().thenRun(() -> System.out.println("\n[OK] Killed chromedriver process...\n"));
                } catch (Exception e) {
                    System.out.println("[Warning] " + e.getMessage());
                }
            }
        } finally {
            //
        }
        System.out.println("[OK] Translate completed");
    }

    @SneakyThrows
    public void killAllProgress() {
        new ProcessBuilder(
                "powershell.exe",
                "taskkill /F /IM chromedriver.exe /T"
        ).start();
    }
}
