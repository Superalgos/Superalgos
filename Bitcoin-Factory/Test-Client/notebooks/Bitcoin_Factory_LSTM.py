#!/usr/bin/env python
# coding: utf-8

# ##### Bitcoin Factory Machine Learning
# 

# # Multivariate Time Series Forecasting with LSTMs in Keras

# ## Time Series Forecasting - Multiple Lag Timesteps - Multiple Labels

# Based on Tutorial from https://machinelearningmastery.com/multivariate-time-series-forecasting-lstms-keras/

# # Strategy

# The strategy is to predict the Candle.Max and Candle.Min of a set of Crypto Assets at the highest timeframe possible, in order to use the prediction to pick the one with higher % of predicted increase in price to take a position in it before that happens.

# # Code to Run

# ## Libraries Used

# In[3]:



from math import sqrt
from numpy import concatenate
from matplotlib import pyplot
from pandas import read_csv
from pandas import DataFrame
from pandas import concat
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM


# ## Functions Used

# In[4]:


# convert series to supervised learning
def series_to_supervised(data, n_in=1, n_out=1, dropnan=True):
	n_vars = 1 if type(data) is list else data.shape[1]
	df = DataFrame(data)
	cols, names = list(), list()
	# input sequence (t-n, ... t-1)
	for i in range(n_in, 0, -1):
		cols.append(df.shift(i))
		names += [('var%d(t-%d)' % (j+1, i)) for j in range(n_vars)]
	# forecast sequence (t, t+1, ... t+n)
	for i in range(0, n_out):
		cols.append(df.shift(-i))
		if i == 0:
			names += [('var%d(t)' % (j+1)) for j in range(n_vars)]
		else:
			names += [('var%d(t+%d)' % (j+1, i)) for j in range(n_vars)]
	# put it all together
	agg = concat(cols, axis=1)
	agg.columns = names
	# drop rows with NaN values
	if dropnan:
		agg.dropna(inplace=True)
	return agg 
 


# ## Load the Parameters Dataset
# 

# In[5]:


parameters_dataset = read_csv(
    '/tf/notebooks/parameters.csv', 
    sep=' ',
    skipinitialspace=True,
    error_bad_lines=False,
    warn_bad_lines=True
)

parameters_dataset


# In[9]:


# supporting both positional access and by name

if set(['PARAMETER']).issubset(parameters_dataset.columns):
        # number of indicator properties that are at the raw dataset. Each set of indicators properties might be at many assets or timeframes.
    NUMBER_OF_INDICATORS_PROPERTIES = int(parameters_dataset.values[2][1])

    # number of timesteps in the secuence that we are going to use to feed the model.
    NUMBER_OF_LAG_TIMESTEPS = int(parameters_dataset.values[3][1])

    # number of assets included at the raw dataset.
    NUMBER_OF_ASSETS = int(parameters_dataset.values[4][1])

    # number of things we are going to predict.
    NUMBER_OF_LABELS = int(parameters_dataset.values[5][1])

    # definition of how the raw dataset is going to be divided between a Traing Dataset and a Test Dataset.
    PERCENTAGE_OF_DATASET_FOR_TRAINING = int(parameters_dataset.values[6][1])

    NUMBER_OF_FEATURES = int(parameters_dataset.values[7][1])

    # hyper-parameters
    NUMBER_OF_EPOCHS = int(parameters_dataset.values[8][1])
    NUMBER_OF_LSTM_NEURONS = int(parameters_dataset.values[9][1])

else:
    
    NUMBER_OF_INDICATORS_PROPERTIES = int(parameters_dataset['NUMBER_OF_INDICATORS_PROPERTIES'][0])
    # number of timesteps in the secuence that we are going to use to feed the model.
    NUMBER_OF_LAG_TIMESTEPS = int(parameters_dataset['NUMBER_OF_LAG_TIMESTEPS'][0])

    # number of assets included at the raw dataset.
    NUMBER_OF_ASSETS = int(parameters_dataset['NUMBER_OF_ASSETS'][0])

    # number of things we are going to predict.
    NUMBER_OF_LABELS = int(parameters_dataset['NUMBER_OF_LABELS'][0])

    # definition of how the raw dataset is going to be divided between a Traing Dataset and a Test Dataset.
    PERCENTAGE_OF_DATASET_FOR_TRAINING = int(parameters_dataset['PERCENTAGE_OF_DATASET_FOR_TRAINING'][0])

    NUMBER_OF_FEATURES = int(parameters_dataset['NUMBER_OF_FEATURES'][0])

    # hyper-parameters
    NUMBER_OF_EPOCHS = int(parameters_dataset['NUMBER_OF_EPOCHS'][0])
    NUMBER_OF_LSTM_NEURONS = int(parameters_dataset['NUMBER_OF_LSTM_NEURONS'][0])


# ## Load the Time-Series Dataset

# In[10]:


timeseries_dataset = read_csv(
    '/tf/notebooks/time-series.csv', 
    header=0, 
    index_col=0,    #The first colum is a timestamp that will be used to index all the data.
    sep=' ', 
    skipinitialspace=True
)

timeseries_dataset


# ## Duplicate the Last Record

# The reframing process shift each record to the left of the shifting window, producing that the last record of data is ignored at the last prediction. To fix this we will duplicate the last record so that the last prediction belongs to the the last piece of information available.

# In[11]:


values = timeseries_dataset.values


# In[7]:


last_record = values[-1:,:]
last_record


# In[8]:


all_records = concatenate((values, last_record), axis=0)
all_records


# In[9]:


# ensure all data is float
values = all_records.astype('float32')


# ## Plot & Verify

# We plot our raw data just to be sure with a glimpse that it is alright.

# In[10]:


# specify columns to plot
groups = [0, 2]
i = 1
# plot each column
pyplot.figure()
for group in groups:
	pyplot.subplot(len(groups), 1, i)
	pyplot.plot(values[:, group])
	pyplot.title(timeseries_dataset.columns[group], y=0.5, loc='right')
	i += 1
pyplot.show()


# ## Normalization

# Normalizing or removing the scale, is a standar prodcedure of any machine learning workflow. 

# In[11]:


# normalize features
scaler = MinMaxScaler(feature_range=(0, 1))
scaled = scaler.fit_transform(values)


# ## Reframing as a Supervised Learning Problem

# Each Raw record needs to be expanded with the previous records in order to be suitable for beeing fed into a LSTM model. Some fields of the record at time = 0 will be used as labels and the ones at time < 0 as features.

# In[12]:


# frame as supervised learning
reframed = series_to_supervised(scaled, NUMBER_OF_LAG_TIMESTEPS, 1)


# In[13]:


reframed


# ## Train and Test Dataset Preparation

# The first part of the dataset will be used to train the model. The last part for calculating the prediction error. Later we will generate the predictions for the test dataset and measure how accurate they were.

# In[14]:


# get values from reframed dataset
values = reframed.values
record_count = len(values)
records_for_training = int(record_count * PERCENTAGE_OF_DATASET_FOR_TRAINING / 100)
records_for_training


# In[15]:


# split into train and test sets
train = values[:records_for_training, :]
test = values[records_for_training:, :]


# In[16]:


train.shape


# In[17]:


test.shape


# ## Split into Input and Outputs

# Here we will split both the Train and the Test datasets into features and labels. 
# Features will be all the information where time < 0. For the labels, we will pick only the first 2 fields of each set of indicator properties, which we expect them to contain the Candle Max and Candle Min for each Asset.

# In[18]:


# split into input and outputs
n_obs = NUMBER_OF_LAG_TIMESTEPS * NUMBER_OF_FEATURES

train_X = train[:, :n_obs]
train_y = train[:, -NUMBER_OF_FEATURES:-(NUMBER_OF_FEATURES-NUMBER_OF_LABELS)]

test_X = test[:, :n_obs]
test_y = test[:, -NUMBER_OF_FEATURES:-(NUMBER_OF_FEATURES-NUMBER_OF_LABELS)]


# In[19]:


train_X


# In[20]:


train_y


# ## Reshape Inputs to fit LSTM type of Network

# This type of Network Architecture requires the features to be in a 3D shape.

# In[21]:


# reshape input to be 3D [samples, timesteps, features]
train_X = train_X.reshape((train_X.shape[0], NUMBER_OF_LAG_TIMESTEPS, NUMBER_OF_FEATURES))
test_X = test_X.reshape((test_X.shape[0], NUMBER_OF_LAG_TIMESTEPS, NUMBER_OF_FEATURES))


# ## Network Architecture

# Here we are using an LSTM architecture for our neural network. This is the type of architecture usually used for problems involving time-series.

# In[22]:


# design network
model = Sequential()
model.add(LSTM(NUMBER_OF_LSTM_NEURONS, input_shape=(train_X.shape[1], train_X.shape[2])))
model.add(Dense(NUMBER_OF_LABELS))
model.compile(loss='mae', optimizer='adam')


# ## Fit the Model

# We print this output so that the caller program can get the results in a JSON object.

# In[23]:


print('{')
print('"trainingOutput": "')


# This is the actual process of training the neural network. 

# In[24]:


# fit network
history = model.fit(
    train_X, 
    train_y, 
    epochs=NUMBER_OF_EPOCHS, 
    batch_size=72, 
    validation_data=(test_X, test_y), 
    verbose=2, 
    shuffle=False
)


# In[25]:


print('"')


# ## Plot Fitting History

# In[26]:


# plot history
pyplot.plot(history.history['loss'], label='train')
pyplot.plot(history.history['val_loss'], label='test')
pyplot.legend()
pyplot.show()


# ## Batch Prediction of all Test Records

# Here we take all Test Records and get a prediction for each one of them. 

# In[27]:


# make a prediction
yhat = model.predict(test_X)
test_X = test_X.reshape((test_X.shape[0], NUMBER_OF_LAG_TIMESTEPS*NUMBER_OF_FEATURES))


# In[28]:


yhat


# ## Reversing Normalization
# 
# For inverting the scale (denormalize) of a test record, we need first to unframe the test_X values so as the get the original record. Since the label was the first colum of the record, we concatenate the prediction to the last columns of the framed record.

# In[29]:


# invert scaling for forecast
inv_yhat = concatenate((yhat, test_X[:, -(NUMBER_OF_FEATURES - NUMBER_OF_LABELS):]), axis=1)
inv_yhat = scaler.inverse_transform(inv_yhat)
inv_yhat = inv_yhat[:,:NUMBER_OF_LABELS]
inv_yhat


# In[30]:


# invert scaling for actual
inv_y = concatenate((test_y, test_X[:, -(NUMBER_OF_FEATURES - NUMBER_OF_LABELS):]), axis=1)
inv_y = scaler.inverse_transform(inv_y)
inv_y = inv_y[:,:NUMBER_OF_LABELS]
inv_y


# ## Error Calculations

# ### Main Error Value

# In[31]:


# calculate RMSE
rmse = sqrt(mean_squared_error(inv_y, inv_yhat))


# This is the main value we use to know how much error there is. We need this value to go as down as possible.

# ### Alternative Error Analisys

# In[32]:


# my way to calculating Errors
errors = (inv_yhat - inv_y) / inv_y * 10000
errors = errors.astype('int') / 100
errors


# ### Plot of the % of Error of each Predicted Value 

# In[33]:


# plot errors
pyplot.plot(errors)
pyplot.show()


# ### Dollar Difference Between Prediction and Actual Value

# In the context of the Test dataset, this is what we get if we substract the Actual Value to the Predicted Value.

# In[34]:


diff = (inv_yhat - inv_y) 
diff = diff.astype('float32')
diff


# ## Returning Predictions & Errors

# Here we are returning the predictions to the caller program. Only the last row of predictions are needed because they belong to the latest closed candle. 

# In[34]:


print(',"predictions": "', inv_yhat[-1], '"' )


# In[35]:


print(',"errorRMSE": %.3f' % rmse)
print('}')


# ##### 

# ###### 
