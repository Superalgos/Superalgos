package com.devosonder.superalgostranslate;

import com.devosonder.superalgostranslate.app.config.TranslatorRunBean;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Translator {
    private static final TranslatorRunBean translatorRunBean = new TranslatorRunBean();

    public static void main(String[] args) {
        doShutDownWork();
        translatorRunBean.run(args);
    }

    private static void doShutDownWork() {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            translatorRunBean.killAllProgress();
        }));
    }
}
