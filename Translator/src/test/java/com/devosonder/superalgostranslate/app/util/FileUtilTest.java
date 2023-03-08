package com.devosonder.superalgostranslate.app.util;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FileUtilTest {


    @Test
    void getAllFiles() {
        List<String> allFiles = FileUtil.getAllFiles("D:\\Projeler\\SuperalgosTranslate\\src\\main\\resources\\data");
        Assertions.assertTrue(allFiles.size() > 0);
    }
}
