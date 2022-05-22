

Random Notes:

1. You can not turn off the minimun 3 labels: Candle Close, Max, Min and 1 Feature: Candle Open. At the Test Server config all this must be ON.
2. Remember that the Test Cases Array JSON file is generated once the first time the Test Server run and does not detect that this file exists. If you change the config adding or removing ON / OFF switches for indicators, you need to manually delete this file and the FForecast Cases Array file so that the Test Server generates it again. Failing to do so will produce errors executing the tests at the Docker container, since dimensions for reshapes will not match, since they were calculated at the moment this file was generated but the changed config produces datasets with other amount of data.

