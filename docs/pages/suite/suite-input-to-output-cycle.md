---
title:  Input-to-Output Cycle
summary: ""
sidebar: suite_sidebar
permalink: suite-input-to-output-cycle.html
---

Indicators use datasets produced by sensors or by other indicators as input. That is, they read an existing dataset, perform calculations over the input data, and store a desired output—hopefully, a value-added product.

Let's review the mechanics of the cycle that turns an input into an output, as that is—in essense—what building a new indicator or creating new datasets entails.

## Input

### 1. Loading Arrays

As explained earlier, indicators store information in arrays of data fields constituting records, in a plain text file. This is highly appropriate for storing data with the minimum possible weight.

For example, a typical record in the Multi-Period-Market Bollinger Bands dataset looks like this:

```
[1425945600000,1426031999999,253.17351109,15.293043836574176,30.586087673148352]
```

That is what the platform will encounter at the time of reading a typical dataset.


### 2. Conversion to Objects with Named Properties

To make data usable for humans, it maps the content of each record with concepts that describe the data. Put in other words, the platform labels each field so that the user doesn't need to know or remember what each data field represents, and stores the data a JSON objetcs in memory.

### 3. Calculation of Not-Stored Properties

When an indicator stores data in the minimized array format discussed earlier, it may chose not to save information that is easily calculable.

For example, imagine the indicator stores buy and sell volumes... does it really need to store the total volume? Given that it is so easy to calculate, the answer is no. 

**It is not worthy to store information that may be easily calculated at a later stage.**

Another example is Paula storing the information about the direction and slope of Bollinger Sub-Channels. In it's current state, Paula stores the following record structure:

```
[1425945600000,1426031999999,"Up","Extreme",1,253.17351109,253.17351109,30.586087673148352,30.586087673148352]
```

If instead of storing "Up" and "Extreme" Paula would map text strings with numbers—for instance 0 for "Up" and 1 for "Down", and do the same with the slope—her dataset would be 10 to 15% lighter. And such descriptive values could easily be assigned upon reading the file.

## Output

### 4. User Code Processing

The in-memory data structure resulting from point 3 above is finally ready to be used as input to perform whatever calculations or general procesing the code of the new indicator may perform.

Once all new desired properties are calculated, a somewhat reverse process is started so as to end up with an output in the similar format as the input. This involves deciding which properties will be written and which will be left out.

### 5. Writting the Output

The final stage is turning the Objects-formatted records back into a minimized array-form and storing it in the corresponding type of dataset.





