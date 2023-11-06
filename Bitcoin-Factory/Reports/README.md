# Bitcoin Factory Reports
This directory includes Bitcoin Factory report files, used to determine Bitcoin Factory Governance rewards.

Operators of reward-providing servers should commit their report files into this directory after a test set (= test round with unchanged testing parameters) has completed. You do not need to take care about the point in time when test cases where returned. The Governance system will recognize this automatically, based on record timestamps.

Each test case must be reflected in exactly one file uploaded to this directory - the same transaction must not be stated in two different files.

## Please pay specific attention to these rules before uploading report files
- You must only upload exactly **one** report file per test round (i.e. set of test cases with unchanged testing parameters).
- If multiple report files are generated for one test round (e.g. because the test server needed to be stopped and restarted), only upload the **last** report file of the test round. Do not upload earlier files, as all records of the earlier files will also be present in the last file.
- Please ensure the report file of your test round is merged into the repository before the Governance distribution executes for the month in which the first tast cases in the round were processed.

## What do need to do when the test case round is not complete before the distribution?
To provide Governance Report files in the middle of a test cycle, please follow these steps:
1. Stop the test server
2. Rename the last report file generated during this round to signal it is incomplete (e.g. _Testnet-YYYY-MM-DD-TEMP.CSV_)
3. Upload the renamed file to the repository
4. Restart the test server
5. After the test round and the distribution cycle has completed, upload the final report file of the test round to the repository.
6. Delete the temporary file you uploaded in step 3 from the repository.

## Report File Naming Convention
Files need to be named in line with this pattern to be recognized by Governance: __Testnet*.csv__

_For example: Testnet-2022-05-28-11-22-00.csv_