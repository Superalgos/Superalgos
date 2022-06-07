package com.devosonder.deepltranslator;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * API for the DeepL Translator
 */
class DeepLTranslatorBase {

    /**
     * For asynchronous translating.
     *
     * @see com.devosonder.deepltranslator.DeepLTranslator#translateAsync(String, com.devosonder.deepltranslator.SourceLanguage, TargetLanguage)
     */
    final ExecutorService executor = Executors.newCachedThreadPool();

    /**
     * All executors used for asynchronous translating.
     */
    static final List<ExecutorService> EXECUTOR_LIST = new ArrayList<>();

    /**
     * For cleaning up the input field on the DeepL site.
     *
     * @see DeepLTranslator#translate(String, com.devosonder.deepltranslator.SourceLanguage, TargetLanguage)
     */
    static final ExecutorService CLEANUP_EXECUTOR = Executors.newCachedThreadPool();

    /**
     * All browser instances created.
     */
    static final List<WebDriver> GLOBAL_INSTANCES = new ArrayList<>();

    /**
     * Available browser instances for this configuration.
     */
    private static final LinkedBlockingQueue<WebDriver> AVAILABLE_INSTANCES = new LinkedBlockingQueue<>();

    /**
     * User-Agent for WebDriver.
     */
    private static final String USER_AGENT;

    /**
     * Script to disable animations on a website.
     * <p>
     * Source: <a href="https://github.com/dcts/remove-CSS-animations">https://github.com/dcts/remove-CSS-animations</a>
     */
    private static final String DISABLE_ANIMATIONS_SCRIPT =
            "document.querySelector('html > head').insertAdjacentHTML(\"beforeend\", \"" +
                    "<style>\\n" +
                    "* {\\n" +
                    "  -o-transition-property: none !important;\\n" +
                    "  -moz-transition-property: none !important;\\n" +
                    "  -ms-transition-property: none !important;\\n" +
                    "  -webkit-transition-property: none !important;\\n" +
                    "  transition-property: none !important;\\n" +
                    "}\\n" +
                    "* {\\n" +
                    "  -o-transform: none !important;\\n" +
                    "  -moz-transform: none !important;\\n" +
                    "  -ms-transform: none !important;\\n" +
                    "  -webkit-transform: none !important;\\n" +
                    "  transform: none !important;\\n" +
                    "}\\n" +
                    "* {\\n" +
                    "  -webkit-animation: none !important;\\n" +
                    "  -moz-animation: none !important;\\n" +
                    "  -o-animation: none !important;\\n" +
                    "  -ms-animation: none !important;\\n" +
                    "  animation: none !important;\\n" +
                    "}\\n" +
                    "</style>\\n" +
                    "\");";

    /**
     * For debugging purposes.
     */
    public static boolean HEADLESS = true;

    static {
        // Set default user agent
        ChromeDriver dummyDriver = newWebDriver();
        String userAgent = (String) dummyDriver.executeScript("return navigator.userAgent");
        USER_AGENT = userAgent.replace("HeadlessChrome", "Chrome");
        dummyDriver.close();
    }

    /**
     * All settings.
     */
    private final com.devosonder.deepltranslator.DeepLConfiguration configuration;

    /**
     * With default settings.
     */
    DeepLTranslatorBase() {
        this.configuration = new com.devosonder.deepltranslator.DeepLConfiguration.Builder().build();
        EXECUTOR_LIST.add(executor);
    }

    /**
     * With custom settings.
     */
    DeepLTranslatorBase(com.devosonder.deepltranslator.DeepLConfiguration configuration) {
        this.configuration = configuration;
        EXECUTOR_LIST.add(executor);
    }

    /**
     * Checks if all arguments are valid, if not, an exception is thrown.
     */
    void isValid(String text, com.devosonder.deepltranslator.SourceLanguage from, TargetLanguage to) throws IllegalStateException {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalStateException("Text is null or empty");
        } else if (from == null || to == null) {
            throw new IllegalStateException("Language is null");
        } else if (text.length() > 5000) {
            throw new IllegalStateException("Text length is limited to 5000 characters");
        }
    }

    /**
     * Generates a request with all settings like timeout etc.
     * and returns the translation if succeeded.
     */
    String getTranslation(String text, SourceLanguage from, TargetLanguage to) throws TimeoutException {
        long timeoutMillisEnd = System.currentTimeMillis() + configuration.getTimeout().toMillis();
        WebDriver driver = AVAILABLE_INSTANCES.poll();

        try {
            if (driver == null) {
                driver = newWebDriver();
                driver.manage().timeouts().pageLoadTimeout(Duration.ofMillis(timeoutMillisEnd - System.currentTimeMillis()));

                GLOBAL_INSTANCES.add(driver);
                driver.get("https://www.deepl.com/translator");
                ((ChromeDriver) driver).executeScript(DISABLE_ANIMATIONS_SCRIPT);
            }
        } catch (TimeoutException e) {
            GLOBAL_INSTANCES.remove(driver);
            if (driver != null) {
                driver.close();
            }
            throw e;
        }

        try {
            // Source language button
            driver.findElements(By.className("lmt__language_select__active")).get(0).click();
            By srcButtonBy = By.xpath("//button[@dl-test='" + from.getAttributeValue() + "']");
            WebDriverWait waitSource = new WebDriverWait(driver, Duration.ofMillis(timeoutMillisEnd - System.currentTimeMillis()));
            waitSource.until(ExpectedConditions.visibilityOfElementLocated(srcButtonBy));
            driver.findElement(srcButtonBy).click();

            // Target language button
            driver.findElements(By.className("lmt__language_select__active")).get(1).click();
            By targetButtonBy = By.xpath("//button[@dl-test='" + to.getAttributeValue() + "']");
            WebDriverWait waitTarget = new WebDriverWait(driver, Duration.ofMillis(timeoutMillisEnd - System.currentTimeMillis()));
            waitTarget.until(ExpectedConditions.visibilityOfElementLocated(targetButtonBy));
            driver.findElement(targetButtonBy).click();
        } catch (TimeoutException e) {
            AVAILABLE_INSTANCES.offer(driver);
            throw e;
        }

        String result = null;
        TimeoutException timeoutException = null;
        By targetTextBy = By.id("target-dummydiv");

        try {
            // Source text
            driver.findElement(By.className("lmt__source_textarea")).sendKeys(text);

            // Target text
            WebDriverWait waitText = new WebDriverWait(driver, Duration.ofMillis(timeoutMillisEnd - System.currentTimeMillis()));
            waitText.pollingEvery(Duration.ofMillis(100));
            ExpectedCondition<Boolean> textCondition;

            if (text.contains("[...]")) {
                textCondition = ExpectedConditions.and(
                        com.devosonder.deepltranslator.DriverWaitUtils.attributeNotBlank(targetTextBy),
                        com.devosonder.deepltranslator.DriverWaitUtils.attributeNotChanged(targetTextBy, Duration.ofMillis(1000))
                );
            } else {
                textCondition = ExpectedConditions.and(
                        com.devosonder.deepltranslator.DriverWaitUtils.attributeNotBlank(targetTextBy),
                        com.devosonder.deepltranslator.DriverWaitUtils.attributeNotContains(targetTextBy),
                        com.devosonder.deepltranslator.DriverWaitUtils.attributeNotChanged(targetTextBy, Duration.ofMillis(1000))
                );
            }

            waitText.until(textCondition);
            result = driver.findElement(targetTextBy).getAttribute("innerHTML");
        } catch (TimeoutException e) {
            timeoutException = e;
        }

        WebDriver finalDriver = driver;

        CLEANUP_EXECUTOR.submit(() -> {
            By buttonClearBy = By.className("lmt__clear_text_button");
            By sourceText = By.id("source-dummydiv");

            try {
                finalDriver.findElement(buttonClearBy).click();
            } catch (NoSuchElementException ignored) {
            }

            WebDriverWait waitCleared = new WebDriverWait(finalDriver, Duration.ofSeconds(10));

            try {
                waitCleared.until(ExpectedConditions.and(
                        com.devosonder.deepltranslator.DriverWaitUtils.attributeBlank(sourceText),
                        DriverWaitUtils.attributeBlank(targetTextBy)
                ));
                AVAILABLE_INSTANCES.offer(finalDriver);
            } catch (TimeoutException e) {
                GLOBAL_INSTANCES.remove(finalDriver);
                finalDriver.close();
            }
        });

        if (timeoutException != null)
            throw timeoutException;

        // Post-processing
        if (result != null && configuration.isPostProcessingEnabled()) {
            result = result
                    .trim()
                    .replaceAll("\\s{2,}", " ");
        }

        return result;
    }

    /**
     * The settings.
     */
    public DeepLConfiguration getConfiguration() {
        return configuration;
    }

    /**
     * Create new WebDriver instance.
     */
    private static ChromeDriver newWebDriver() {
        ChromeOptions options = new ChromeOptions();

        if (HEADLESS) {
            options.addArguments("--headless");
        }

        options.addArguments("--disable-gpu", "--window-size=1920,1080");
        options.addArguments("--disable-blink-features=AutomationControlled");

        if (USER_AGENT != null) {
            options.addArguments("--user-agent=" + USER_AGENT);
        }

        ChromeDriver driver = new ChromeDriver(options);
        driver.executeScript("Object.defineProperty(screen, 'height', {value: 1080, configurable: true, writeable: true});");
        driver.executeScript("Object.defineProperty(screen, 'width', {value: 1920, configurable: true, writeable: true});");
        driver.executeScript("Object.defineProperty(screen, 'availWidth', {value: 1920, configurable: true, writeable: true});");
        driver.executeScript("Object.defineProperty(screen, 'availHeight', {value: 1080, configurable: true, writeable: true});");

        return driver;
    }

}
