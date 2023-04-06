package com.devosonder.superalgostranslate.app.util;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

class FileUtilTest {


    @Test
    void getAllFiles() {
        Path currentRelativePath = Paths.get("");
        String absolutePath = currentRelativePath.toAbsolutePath().toString();

        List<String> allFiles = FileUtil.getAllFiles(absolutePath + "\\src\\main\\resources\\data");
        Assertions.assertTrue(allFiles.size() > 0);
    }
}
