# Documentation export

The documentation is now ready for exporting as a static website. The process will convert all the schemas into human readable documentation as '.html' pages. All necessary images, icons, fonts, stylesheets and javascript libraries are transfered to the local directory during the process.

## Process arguments

Argument | abbreviation | default value | description 
---|---|---|--
--local-directory | -l | My-Storage/_site | this is the local directory that you want to export the static files to
--remote-directory | -r | My-Storage/_site | this is the folder that the files will live under on the remote directory. if you wanted to host it on superalgos.org/docs/index.html then you would supply `-r=docs` if you want the files to live under a root directory then you will need to pass in an empty string argument `-r=""`
--bots | -b | false | this argument determines whether to include a robots.txt file to disallow crawling. To enable crawling add the `--bots` or `-b` argument
--shtml | n/a | false | this argument determines whether to export the docs '\*.shtml' files instead of '\*.html' files

## Execution

To export the documentation run `node export-docs` with all the necessary arguments listed above
