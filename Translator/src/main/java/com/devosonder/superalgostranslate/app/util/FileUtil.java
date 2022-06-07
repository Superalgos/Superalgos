package com.devosonder.superalgostranslate.app.util;

import com.devosonder.superalgostranslate.app.exception.DirectoryNotFoundException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FileUtil {
    public static List<String> getAllFiles(String directoryPath) {
        Path start = Paths.get(directoryPath);
        try (Stream<Path> stream = Files.walk(start, Integer.MAX_VALUE)) {
            return stream
                    .map(String::valueOf)
                    .filter(file -> !new File(file).isDirectory()).filter(file -> file.endsWith(".json"))
                    .sorted()
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new DirectoryNotFoundException("Directory not found: " + directoryPath);
        }
    }

    public static File getTranslatedFile(String originalFilePath) {
        String translatedFilePath = originalFilePath.replace(".json", "_translated.json");
        return new File(translatedFilePath);
    }

    public static boolean isTranslated(String filePath) {
        String translatedFilePath = filePath.replace(".json", "_translated.json");
        return new File(translatedFilePath).exists();
    }

    public static List<String> getAllDirectories(String dir) {
        Path start = Paths.get(dir);
        try (Stream<Path> stream = Files.walk(start, Integer.MAX_VALUE)) {
            return stream
                    .map(String::valueOf)
                    .filter(directory -> new File(directory).isDirectory())
                    .filter(directory ->
                            directory.endsWith("Docs-Tutorials") ||
                                    directory.endsWith("Docs-Nodes") ||
                                    directory.endsWith("Docs-Reviews") ||
                                    directory.endsWith("Docs-Concepts") ||
                                    directory.endsWith("Docs-Space-Settings") ||
                                    directory.endsWith("Docs-Space-Style") ||
                                    directory.endsWith("Docs-Topics") ||
                                    directory.endsWith("Docs-Basics") ||
                                    directory.endsWith("Docs-Commands") ||
                                    directory.endsWith("Docs-Commands-Errors") ||
                                    directory.endsWith("Docs-Commands-Messages") ||
                                    directory.endsWith("Docs-Context-Menu-Actions") ||
                                    directory.endsWith("Docs-Languages") ||
                                    directory.endsWith("Docs-Paragraph-Styles")
                    )
                    .sorted()
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new DirectoryNotFoundException("Directory not found: " + dir);
        }

    }

    public static List<String> getAllTranslatedFiles(String dir) {
        Path start = Paths.get(dir);
        try (Stream<Path> stream = Files.walk(start, Integer.MAX_VALUE)) {
            return stream
                    .map(String::valueOf)
                    .filter(file -> !new File(file).isDirectory()).filter(file -> file.endsWith("_translated.json"))
                    .sorted()
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new DirectoryNotFoundException("Directory not found: " + dir);
        }
    }
}
