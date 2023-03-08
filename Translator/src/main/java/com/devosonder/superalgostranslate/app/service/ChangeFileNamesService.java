package com.devosonder.superalgostranslate.app.service;

import com.devosonder.superalgostranslate.app.exception.FileAccessException;
import com.devosonder.superalgostranslate.app.util.FileUtil;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class ChangeFileNamesService {
    public void change(String dir) {
        List<String> translatedFiles = FileUtil.getAllTranslatedFiles(dir);
        for (String translatedFile : translatedFiles) {
            String originalFile = translatedFile.replace("_translated.json", ".json");
            Path originalFilePath = Path.of(originalFile);
            try {
                Files.deleteIfExists(originalFilePath);
            } catch (IOException e) {
                throw new FileAccessException("Could not delete file: " + originalFile);
            }
            try {
                Files.move(Paths.get(translatedFile), originalFilePath);
            } catch (IOException e) {
                throw new FileAccessException("Could not move file: " + translatedFile);
            }
        }
    }
}
