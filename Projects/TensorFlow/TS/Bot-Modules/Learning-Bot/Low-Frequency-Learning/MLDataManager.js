/*  MLDataManager.js : mlDataObj:
 *  Author: Philip Love (Pluvtech)
 *  History:
 *      7/25/21:    Start
 *      7/31/21:    Name Change for SA-ML Integration
 *      8/24/21:    Pushing as beta
 * 
 *  ToDo:
 *      1.) Clean any erroneous samples
 *      2.) Develop a scheme to not call toArray() as often. Especially in stats()
 *      3.) Expand logic to include more than one input, i.e.- Higher ranks
 *      4.) Expose stats to public.
 *      5.) Expand Feature Engineering Section.
 */

exports.newMLDataObj = function(featureLen, labelLen) {
    const MODULE_NAME = 'ML Data Manager';

    /* Dependencies Section: */
    const tf = require("@tensorflow/tfjs-node");

    /* Variables Section: */
    var _features = {};     // Features Object
    var _labels = {};       // Labels Object
    //var _rank = [];       // Future expansion placeholder variable. [Feature Tensor Rank, Label Tensor Rank]

    /* stats{} : Statistics producer object:
     *  count:  returns: int
     *  mean:   returns: { FMeans:[], LMeans:[] }
     *  std:    returns: { FSTDs:[], LSTDs:[] }
     *  variance: returns: { FVar:[], lVar:[] }
     *  minMaxMedRange: returns: { fMax:[], fMin:[], fMedian:[], fRange:[],
     *                             lMax:[], lMin:[], lMedian:[], lRange:[] }
     * all: returns {count, mean{}, minMaxMedRange{}, std{}, variance{} }
     */
    var stats = {};

    var dataObject = {
        addFeatures: addFeatures,    // addFeatures(fArr)
        addLabels: addLabels,      // addLabels(lArr)
        featuresToArray: () => { return toArray('features') },
        labelsToArray: () => { return toArray('labels') },
        featuresTensor: () => { return tensorMaker('features') },
        labelsTensor: () => { return tensorMaker('labels') },
        dataEngineering:    dataEngineering,
        minMaxScaler: minMaxScaler,   // minMaxScaler(sMin, sMax, fNum)
        standardScaler: standardScaler, // standardScaler(fNum)
        print: print
    };

    // Auto Constructor:
    (() => {
        let fStr = "Feature #";
        let lStr = "Label #";
        for (let i = 1; i <= featureLen; i++) {
            _features[fStr + i] = [];
        }
        for (let i = 1; i <= labelLen; i++) {
            _labels[lStr + i] = [];
        }
    })();

    stats = {
        mean: () => {
            let meansObj = { fMeans: [], lMeans: [] };
            let fArr = toArray('features');
            let lArr = toArray('labels');
            fArr.forEach(e => meansObj['fMeans'].push(meanArr(e)));
            lArr.forEach(e => meansObj['lMeans'].push(meanArr(e)));
            return meansObj;
        },
        std: () => {
            let stdObj = { fStds: [], lStds: [] };
            let means = stats.mean();
            let fArr = toArray('features');
            let lArr = toArray('labels');
            fArr.forEach((e, i) => stdObj['fStds'].push(STDev(e, means['fMeans'][i], false)));
            lArr.forEach((e, i) => stdObj['lStds'].push(STDev(e, means['lMeans'][i], false)));
            return stdObj;
        },
        count: () => { return _features['Feature #1'].length },
        variance: () => {
            let varianceObj = { fVar: [], lVar: [] };
            let means = stats.mean();
            let fArr = toArray('features');
            let lArr = toArray('labels');
            fArr.forEach((e, i) => varianceObj['fVar'].push(STDev(e, means['fMeans'][i], true)));
            lArr.forEach((e, i) => varianceObj['lVar'].push(STDev(e, means['lMeans'][i], true)));
            return varianceObj;
        },
        minMaxMedRange: () => {
            let mmmrObj = {
                fMin: [], lMin: [], fMax: [], lMax: [],
                fRange: [], lRange: [], fMedian: [], lMedian: []
            };
            let fArr = toArray('features');
            let lArr = toArray('labels');
            fArr.forEach(e => mmmrObj['fMin'].push(Math.min(...e)));
            lArr.forEach(e => mmmrObj['lMin'].push(Math.min(...e)));
            fArr.forEach(e => mmmrObj['fMax'].push(Math.max(...e)));
            lArr.forEach(e => mmmrObj['lMax'].push(Math.max(...e)));
            mmmrObj['fMax'].forEach((e, i) =>
                mmmrObj['fRange'].push(e - mmmrObj['fMin'][i]));
            mmmrObj['lMax'].forEach((e, i) =>
                mmmrObj['lRange'].push(e - mmmrObj['lMin'][i]));
            // Median:
            let findMedian = (e) => {
                let sorted = e.slice().sort((a, b) => a - b);
                let mid = Math.floor(sorted.length / 2);
                return (sorted.length % 2 === 0) ?
                    (sorted[mid - 1] + sorted[mid]) / 2 :
                    sorted[mid];
            }
            fArr.forEach(e => mmmrObj['fMedian'].push(findMedian(e)));
            lArr.forEach(e => mmmrObj['lMedian'].push(findMedian(e)));
            return mmmrObj;
        },
        all: () => {
            allStatsObj = {};
            allStatsObj.mean = stats.mean();
            allStatsObj.std = stats.std();
            allStatsObj.count = stats.count();
            allStatsObj.variance = stats.variance();
            allStatsObj.minMaxMedRange = stats.minMaxMedRange();
            return allStatsObj;
        }
    };

    return dataObject;
    

    /* ===========================================================================
     * Methods Section:
     */
    
    // addFeatures() : fArr should be => [ Feature, Feature, ... ]
    function addFeatures(fArr) {
        let fStr = "Feature #";
        fArr.forEach((e, i) => _features[fStr+(i+1)].push(e));
    }

    // addLabels() : lArr should be => [ Label, Label, ... ]
    function addLabels(lArr) {
        let lStr = "Label #";
        lArr.forEach((e, i) => _labels[lStr+(i+1)].push(e));
    }

    /*  featuresArr() : returns the features as an array like =>
     *  [[Feature 1, Feature 1, ...], [Feature 2, Feature 2, ...], [ ... ]]
     */
    function toArray(aType) {
        arr = [];
        let arrType = (aType === 'features') ? _features : _labels;
        Object.entries(arrType).forEach(entry => {
            const [key, value] = entry;
            arr.push(value);
        });
        return arr;
    }

    // tensorMaker() : Return TF.Tensor:
    function tensorMaker(tType) {
        let tArr = toArray(tType);
        let tensorFormat = [];
        for (let i = 0; i < tArr[0].length; i++) {
            let sample = [];
            for (let fNum = 0; fNum < tArr.length; fNum++) {
                sample.push(tArr[fNum][i]);
            }
            tensorFormat.push(sample);
        }
        return tf.tensor(tensorFormat);
    }


    /* ===========================================================================
     * Feature Engineering Section:
     */

    // dataEngineering() : Wrapper for data transformations:
    async function dataEngineering(learningSystem) {

        // Check if performing any feature engineering:
        let dataFeaturesArr = learningSystem.machineLearningLibrary.typeOfLearning.typeOfModel.model.api.layersModel.inputLayer.inputFeatures.dataFeatures;

        for (let i = 0, fNum = 1; i < dataFeaturesArr.length; i++, fNum++) {
            if (dataFeaturesArr[i].featurePreprocessing !== undefined) {
                /* NOTE: If more than one preprocessor has been chosen then they will be processed in the order
                 *  in which they are listed here. This order should be considered or this function re-written in 
                 * the event of future pre-processor additions to SA.
                 */
                let pType = dataFeaturesArr[i].featurePreprocessing;

                if (pType.minMaxScaler !== undefined) {
                    let sMin = (pType.minMaxScaler.config.minimum !== undefined) ?
                                    pType.minMaxScaler.config.minimum : 0;
                    let sMax = (pType.minMaxScaler.config.maximum !== undefined) ?
                                    pType.minMaxScaler.config.maximum : 1;
                    minMaxScaler(sMin, sMax, fNum);
                }
                if (pType.standardScaler !== undefined) {
                    standardScaler(fNum);
                }
            }
        }
    }
    /* Scalers / Normalizers:
     * 
     *  minMaxScaler( feature_range=(low), (high) , feature_num):
     *  Formula: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.MinMaxScaler.html
     *  X_std = (X - X.min) / (X.max - X.min)
     *  X_scaled = X_std * (max - min) + min
     */
    function minMaxScaler(sMin, sMax, fNum) {
        let fStr = "Feature #" + fNum;
        let fArr = _features[fStr];
        let xMin = Math.min(...fArr);
        let xMax = Math.max(...fArr);
        let scaled = [];
        fArr.forEach(e => scaled.push(((e - xMin) / (xMax - xMin)) * (sMax - sMin) + sMin));
        _features[fStr] = scaled;
    }

    /*  standardScaler( feature_num )
     *  Standardize features by removing the mean and scaling to unit variance.
     *  x = (X`i - μ) / σ
     * This will force every feature to have a mean of 0 and a standard deviation of 1,
     * and thus be scaled well relative to each other.
     */
    function standardScaler(fNum) {
        let fStr = "Feature #" + fNum;
        let i = fNum - 1;
        let fArr = _features[fStr];
        let mean = stats.mean(); //fArr.reduce((accumulator, currentValue) => accumulator + currentValue) / fArr.length;
        let std = stats.std();
        let scaled = [];
        fArr.forEach(e => scaled.push((e - mean['fMeans'][i]) / std['fStds'][i]));
        _features[fStr] = scaled;
    }


    /* ===========================================================================
     * Helper Math Functions:
     */
    
    // STDev() : if retVar == true then STDev will return Variance else Standard Deviation.
    function STDev(dataArr, mean, retVar) {
        let numerator = 0;
        let denominator = dataArr.length;
        dataArr.forEach(e => {
            numerator += Math.pow((e - mean), 2);
        });
        let variance = numerator / denominator;
        return (retVar === undefined || !retVar) ? Math.sqrt(variance) : variance;
    };

    function meanArr(dataArr) {
        return dataArr.reduce((accumulator, currentValue) => accumulator + currentValue) / dataArr.length;
    }


    /* ===========================================================================
     * Extra Functionality:
     */

    // print() : Top portion is Feature/Label Hard Numbers then Bottom is Statistics:
    function print() {
        let fkeys = [], fvalues = [], lkeys = [], lvalues = [];
        Object.entries(_features).forEach(entry => {
            const [key, value] = entry;
            fkeys.push(key);
            fvalues.push(value);
        });
        Object.entries(_labels).forEach(entry => {
            const [key, value] = entry;
            lkeys.push(key);
            lvalues.push(value);
        });
        let topSeparator = "__________________________________________________";
        let separator = "==================================================";
        let buf = "\n" + topSeparator + "\nSuperalgos ML DataFrame:\n";
        let separator2 = "||||||||||||||||||||||||||||||||||||||||||||||||||";
        buf += separator;
        let fkLen = fkeys.length, fvLen = fvalues[0].length;
        let lkLen = lkeys.length;
        SA.logger.info(buf);

        // Features / Labels Hard Numbers:
        for (let i = 0; i < fvLen; i++) {
            buf = "Sample[" + i + "]=>\n";
            for (let j = 0; j < fkLen; j++) {
                buf += "\t" + fkeys[j] + ": [" + fvalues[j][i].toFixed(5) + "...]\n";
            }
            for (let k = 0; k < lkLen; k++) {
                buf += "\t" + lkeys[k] + ": [" + lvalues[k][i].toFixed(5) + "...]\n";
            }
            buf += separator;
            if (i > 3 && fvLen > 9 && i < fvLen - 6) {  // Fast-forward
                buf += "\n\t\t" + "..." + "\n\t\t" + "..." + "\n\t\t" + "...\n" + separator;
                i = fvLen - 6;
            }
            SA.logger.info(buf);
        }

        // Statistics:
        buf = separator2 + "\n" + separator + "\n\n" + topSeparator + "\nSuperalgos ML DataFrame Statistics:\n" + separator;
        let statistics = stats.all();
        SA.logger.info(buf);

        for (let i = 0; i < fkLen; i++) {
            buf = fkeys[i] + ":\n\tCount:\t[" + statistics.count + "]\n";
            buf += "\tMean:\t[" + statistics.mean.fMeans[i] + "]\n";
            buf += "\tMedian:\t[" + statistics.minMaxMedRange.fMedian[i] + "]\n";
            buf += "\tSTDev:\t[" + statistics.std.fStds[i] + "]\n";
            buf += "\tVariance: [" + statistics.variance.fVar[i] + "]\n";
            buf += "\tMin: [" + statistics.minMaxMedRange.fMin[i].toFixed(4) + "...]\n" +
                "\tMax: [" + statistics.minMaxMedRange.fMax[i].toFixed(4) + "...]\n" +
                "\tRange: [" + statistics.minMaxMedRange.fRange[i].toFixed(4) + "...]\n";
            buf += topSeparator;
            SA.logger.info(buf);
        }

        for (let j = 0; j < lkLen; j++) {
            buf = lkeys[j] + ":\n\tCount:\t[" + statistics.count + "]\n";
            buf += "\tMean:\t[" + statistics.mean.lMeans[j] + "]\n";
            buf += "\tMedian:\t[" + statistics.minMaxMedRange.lMedian[j] + "]\n";
            buf += "\tSTDev:\t[" + statistics.std.lStds[j] + "]\n";
            buf += "\tVariance: [" + statistics.variance.lVar[j] + "]\n";
            buf += "\tMin: [" + statistics.minMaxMedRange.lMin[j].toFixed(4) + "...]\n" +
                "\tMax: [" + statistics.minMaxMedRange.lMax[j].toFixed(4) + "...]\n" +
                "\tRange: [" + statistics.minMaxMedRange.lRange[j].toFixed(4) + "...]\n";
            buf += topSeparator;
            SA.logger.info(buf);
        }
        SA.logger.info(separator + "\n" + separator2 + "\n" + separator);
    }


    /*  A rank two tensor is what we typically think of as a matrix, a rank one tensor is a vector.
     *  For a rank two tensor you can access any element with the syntax t[i, j].
     *  For a rank three tensor you would need to address an element with t[i, j, k].
     */
    // setRank() : placeholder for future expansion past sequential model.
    /*setRank() {

    }
    */
}