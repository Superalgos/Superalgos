## What is it?

It automatically translates the language translation files in the Superalgos project into a language of your choice. The translation files are located in the following folders.

* Docs-Tutorials
* Docs-Nodes
* Docs-Reviews
* Docs-Concepts
* Docs-Space-Settings
* Docs-Space-Style
* Docs-Topics
* Docs-Basics
* Docs-Commands
* Docs-Commands-Errors
* Docs-Commands-Messages
* Docs-Context-Menu-Actions
* Docs-Languages
* Docs-Paragraph-Styles

### How is the translation done?
https://deepl.com is used for translations. Normally DeepL needs authorization key which can be obtained for free but requires registration.
Currently there is a hardcoded authorization key used, but if you want to use your own you have to replace it in the `TranslatorRunBean.java` file:

```
Translator translator = new Translator("e6ec7277-1288-6ac3-3451-db77c52900b0:fx");
```

### Does the original file structure get corrupted during translation?
No. In the project, many checks are made to ensure that the json file structure is not corrupted.

### Requirements (for users)
* Windows 10+ (It does not work on Linux operating system yet)
* Java 11+ (You can download it from https://www.oracle.com/technetwork/java/javase/downloads/jdk11-downloads-5066655.html)
* https://java.tutorials24x7.com/blog/how-to-install-java-11-on-windows
* Chromedriver.exe (Go to https://chromedriver.chromium.org/downloads and download version that matches your browser. To check your version go to the Help -> About Google Chrome
![Chrome Version](./doc-resources/chrome_version.png))
* Copy chromedriver.exe in the zip file to C:\Windows\System32\ OR a desired location and add the folder containing chromedriver.exe to the "PATH" Environment Variable. For help, you can visit https://www.computerhope.com/issues/ch000549.htm.)


### How to use?
* Go to the Translator folder with `cd ./Translator` command.
* Run `.\mvnw clean package` command.
* Run `cd .\bin`
* `java -jar translator.jar` command to see the usage and list of supported languages.
* Start the translate process with `java -jar translator.jar <root folder> <language code>` command.
* Example: `java -jar translator.jar C:\Superalgos pl`
* If you want, you can translate only for a specific module.
* Example: `java -jar translator.jar C:\Superalgos\Projects\Foundations pl`
* Depending on the folder you give as a parameter, the process may take longer.
* During the translation process, "<original_name>_translated.json" files are added where the original files are located.

  ![File structure](./doc-resources/files.png)
* Perform your translation checks in the file with the suffix "_translated.json" and correct the necessary parts.
  ![Control](./doc-resources/control.png)
* After all checks are completed, run `java -jar translator.jar C:\Superalgos apply-translations` to replace the "_translated.json" files with the original files.
* Translator does not use "git" commands in any way.
* If you have no problems, you can now commit and create a Pull Request. :-) Good job!

### What happens if I stop the Translator from running?
* Probably nothing will happen. When you restart it, it will pick up where it left off.

### Restrictions
* Translator uses official DeepL Java Lib: https://github.com/DeepLcom/deepl-java
* Translator does not need the API key. If you do a lot of translations, you may get stuck in daily limits. In this case, it can continue to work from a different internet IP address (I use a VPN).
* In some cases, errors may occur during translation. For this reason, some files cannot be translated. This is not a big problem. Because if you run Translator again, it will translate the files that were skipped without translation.
