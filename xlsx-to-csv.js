/********************************************************************************
 * 
 * Utility class to convert xlsx transaction history exports into csv for the 
 * trade reporting tool to analyse
 * 
 * Run:
 *   node xlsx-to-csv.js -i <PATH_TO_INPUT_FILE> -o <PATH_TO_OUTPUT_FILE>
 * 
 ********************************************************************************/


const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const XLSX = require('xlsx')
const fs = require('fs')

let argv = yargs(hideBin(process.argv))
    .version(require('./package.json').version)
    .alias('h', 'help')
    .options('input-file', {
        alias: 'i',
        string: true,
        demandOption: true
    })
    .options('output-file', {
        alias: 'o',
        string: true,
        demandOption: true
    })
    .help()
    .parse()


const workbook = XLSX.readFile(argv.inputFile, {type: 'string'})
const sheetNames = workbook.SheetNames;
// only taking the first worksheet
const worksheet = workbook.Sheets[sheetNames[0]]
const csv = XLSX.utils.sheet_to_csv(worksheet)
fs.writeFileSync(argv.outputFile, csv)
