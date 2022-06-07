package com.devosonder.superalgostranslate.app.config;

import com.devosonder.deepltranslator.DeepLTranslator;
import com.devosonder.deepltranslator.TargetLanguage;
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
        if (args.length == 2 && args[1].equals("apply-translations")) {
            var dir = args[0];
            changeFileNamesService.change(dir);
            System.exit(0);
        } else if (args.length < 2) {
            System.out.println("java -jar translator.jar <rootFolderName> <targetLanguage>");
            System.out.println("Supported Target languages: ");
            StringBuilder languages = new StringBuilder();
            for (TargetLanguage value : TargetLanguage.values()) {
                languages.append(value.getLanguageCode()).append(" ");
            }
            System.out.println(languages);
            System.exit(1);
        }
        var dir = args[0];
        TargetLanguage targetLanguage = null;
        try {
            targetLanguage = TargetLanguage.getLanguage(args[1]).get();
        } catch (Exception e) {
            System.out.println("Invalid language.\nSupported Target languages: ");
            StringBuilder languages = new StringBuilder();
            for (TargetLanguage value : TargetLanguage.values()) {
                languages.append(value.getLanguageCode()).append(" ");
            }
            System.out.println(languages);
            System.exit(1);
        }
        System.out.println("Translating from: " + dir);

        System.out.println("[  ] Looking for folders for translation...");
        List<String> allDirectories = FileUtil.getAllDirectories(dir);
        System.out.println("[OK] Looking for folders for translation...");
        System.out.println("[  ] Translate starting. Please wait...");
        var translator = TranslatorFactory.getTranslator();
        translator.awaitTermination(10, TimeUnit.SECONDS);
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
            DeepLTranslator.shutdown();
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
