#!/usr/bin/env python
# coding: utf-8

import random
import pandas as pd
#import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import os, sys, time, platform, subprocess
import math
import json
from typing import Dict, List, Optional, Union
from sklearn.model_selection import train_test_split
from sklearn import preprocessing
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf

def import_install_packages(package):
    # This is an evil little function
    # that installs packages via pip.
    # This means the script can install
    # it's own dependencies.
    try:
        __import__(package)
    except:
        import subprocess
        subprocess.call([sys.executable, "-m", "pip", "install", package])

import_install_packages('string')
import string

import_install_packages('packaging')
from packaging.version import parse as parse_version

import_install_packages('importlib')
import importlib

import_install_packages('quantstats')
import quantstats
quantstats.extend_pandas()

import_install_packages('gym==0.12.1')
import gym as gym
from gym import spaces

import_install_packages('numpy==1.23.3')
import numpy as np

import_install_packages('ray[all]==1.12.1')
import ray

import_install_packages('tabulate')
from tabulate import tabulate

import_install_packages('py-rsync')

print("""Python version: %s
Platform: %s
""" % (
sys.version.split('\n'),
platform.platform()
))
sys.stdout.write('\n')
print("TF: ", tf.__version__)
sys.stdout.write('\n')
print("NP: ", np.__version__)
sys.stdout.write('\n')
print("PD: ", pd.__version__)
sys.stdout.write('\n')
print("keras: ", tf.keras.__version__)
sys.stdout.write('\n')
print("RAY: ", ray.__version__)
sys.stdout.write('\n')

if parse_version(ray.__version__) < parse_version("1.12.1"):
    import subprocess
    subprocess.call([sys.executable, "-m", "pip", "install", "ray[all]>1.12.0"])    
    import_install_packages('importlib')
    importlib.reload(ray)
    print("New RAY: ", ray.__version__)
    sys.stdout.write('\n')    

from ray import tune
from ray.rllib.agents import ppo
from ray.tune import CLIReporter
from ray.tune import ProgressReporter
from ray.tune.registry import register_env
from ray.rllib.env import BaseEnv
from ray.rllib.env.vector_env import VectorEnv #unused
from ray.rllib.agents.callbacks import DefaultCallbacks
from ray.rllib.evaluation import MultiAgentEpisode, RolloutWorker
from ray.rllib.policy import Policy
from ray.rllib.policy.sample_batch import SampleBatch

location: str = "/tf/notebooks/"
instructions_file: str = "instructions.csv"
run_forecast: bool = False
res_dir: str = location + "/ray_results/"
RESUME = False # Resume training from the last checkpoint if any exists  [True, False, 'LOCAL', 'REMOTE', 'PROMPT', 'ERRORED_ONLY', 'AUTO']

if os.path.isfile(location+instructions_file): #Forecaster
    run_forecast = True

    # Load the Instructions Dataset
    instructions_dataset = pd.read_csv(
        '/tf/notebooks/instructions.csv',
        header=0,
        sep=' ',
        skipinitialspace=True
    )

    # what are we going to do in the current run?
    ACTION_TO_TAKE = instructions_dataset.values[0][1]

    # name of the model file to load or save.
    MODEL_FILE_NAME = instructions_dataset.values[1][1]

    FILENAME_parameters_dataset = instructions_dataset.values[2][1]
    FILENAME_timeseries_dataset = instructions_dataset.values[3][1]

    res_dir = location + "/models/" + MODEL_FILE_NAME + "/"
    RESUME = "AUTO"
    
    parameters = pd.read_csv(
        '/tf/notebooks/'+FILENAME_parameters_dataset,
        header=0,
        sep=' ',
        skipinitialspace=True
    )
    df = pd.read_csv(
        location+FILENAME_timeseries_dataset, 
        header=0, 
        index_col=None,
        sep=' ', 
        skipinitialspace=True
    )      

else: #Testclient
    parameters = pd.read_csv(
        location+'parameters.csv', 
        sep=' ', 
        skipinitialspace=True,   
    )
    df = pd.read_csv(
        location+'time-series.csv', 
        header=0, 
        index_col=None,
        sep=' ', 
        skipinitialspace=True
    )    

if {'TIMESTEPS_TO_TRAIN'}.issubset(parameters.columns):
    EXPERIMENT_NAME = "Trading_Signal_Predictor_RL_V01"
    PERCENTAGE_OF_DATASET_FOR_TRAINING = 80
    TIMESTEPS_TO_TRAIN = parameters['TIMESTEPS_TO_TRAIN'][0]
    OBSERVATION_WINDOW_SIZE = parameters['OBSERVATION_WINDOW_SIZE'][0]
    INITIAL_QUOTE_ASSET = parameters['INITIAL_QUOTE_ASSET'][0]
    INITIAL_BASE_ASSET = parameters['INITIAL_BASE_ASSET'][0]
    INITIAL_BASE_ASSET_SHORT = 0
    TRADING_FEE = parameters['TRADING_FEE'][0]
    ENV_VERSION = parameters['ENV_VERSION'][0]
    ENV_NAME =  parameters['ENV_NAME'][0]
    EXPLORE_ON_EVAL = parameters['EXPLORE_ON_EVAL'][0]

    # Hyper-parameters, in case we want to really control them from the test server not from ray
    ALGORITHM = parameters['ALGORITHM'][0]
    ROLLOUT_FRAGMENT_LENGTH = parameters['ROLLOUT_FRAGMENT_LENGTH'][0]
    TRAIN_BATCH_SIZE = parameters['TRAIN_BATCH_SIZE'][0]
    SGD_MINIBATCH_SIZE = parameters['SGD_MINIBATCH_SIZE'][0]
    BATCH_MODE = parameters['BATCH_MODE'][0]
    #VF_CLIP_PARAM = parameters['VF_CLIP_PARAM'][0]
    FC_SIZE = [parameters['FC_SIZE'][0]]
    LEARNING_RATE = parameters['LEARNING_RATE'][0]
    GAMMA = parameters['GAMMA'][0]

else:
    EXPERIMENT_NAME = "Trading_Signal_Predictor_RL_V01"
    PERCENTAGE_OF_DATASET_FOR_TRAINING = 80
    TIMESTEPS_TO_TRAIN = int(parameters.values[2][4])
    OBSERVATION_WINDOW_SIZE = int(parameters.values[2][5])
    INITIAL_QUOTE_ASSET = int(parameters.values[2][6])
    INITIAL_BASE_ASSET = int(parameters.values[2][7])
    INITIAL_BASE_ASSET_SHORT = 0
    TRADING_FEE = float(parameters.values[2][8])
    ENV_NAME =  str(parameters.values[2][9])
    ENV_VERSION = int(parameters.values[2][10])
    EXPLORE_ON_EVAL = str(parameters.values[2][12])

    # Hyper-parameters, in case we want to really control them from the test server not from ray
    ALGORITHM = str(parameters.values[2][13])
    ROLLOUT_FRAGMENT_LENGTH = int(parameters.values[2][14])
    TRAIN_BATCH_SIZE = int(parameters.values[2][15])
    SGD_MINIBATCH_SIZE = int(parameters.values[2][16])
    BATCH_MODE = str(parameters.values[2][17])
    #VF_CLIP_PARAM = parameters['VF_CLIP_PARAM'][0]
    FC_SIZE = int(parameters.values[2][18])
    LEARNING_RATE = float(parameters.values[2][19])
    GAMMA = float(parameters.values[2][20])


MIN_TRADE_SIZE = INITIAL_QUOTE_ASSET / 10 # should be moved into SA TestServer config
MAX_LOSS_FACTOR = 0.5

print(f'TIMESTEPS_TO_TRAIN: {TIMESTEPS_TO_TRAIN}\n')
print(f'OBSERVATION_WINDOW_SIZE: {OBSERVATION_WINDOW_SIZE}\n')
print(f'INITIAL_QUOTE_ASSET: {INITIAL_QUOTE_ASSET}\n')
print(f'INITIAL_BASE_ASSET: {INITIAL_BASE_ASSET}\n')
print(f'INITIAL_BASE_ASSET_SHORT: {INITIAL_BASE_ASSET_SHORT}\n')
print(f'TRADING_FEE: {TRADING_FEE}\n')
print(f'MIN_TRADE_SIZE: {MIN_TRADE_SIZE}\n')
print(f'MAX_LOSS_FACTOR: {MAX_LOSS_FACTOR}\n')

def prepare_data(df):
    # renaming column labels as we wish, regardless what test server sends, hopefully he will maintain position
    df.rename(columns={df.columns[0]: "date"}, inplace=True)
    df.rename(columns={df.columns[1]: "high"}, inplace=True)
    df.rename(columns={df.columns[2]: "low"}, inplace=True)
    df.rename(columns={df.columns[3]: "close"}, inplace=True)
    df.rename(columns={df.columns[4]: "open"}, inplace=True)
    df.rename(columns={df.columns[5]: "volume"}, inplace=True)
    
    df['volume'] = np.int64(df['volume'])
    df['date'] = pd.to_datetime(df['date'],  unit='ms')
    df.sort_values(by='date', ascending=True, inplace=True)
    df.reset_index(drop=True, inplace=True)
    df['date'] = df['date'].dt.strftime('%Y-%m-%d %I:%M %p')

    return df

data = prepare_data(df)

# Setup which data to use for training and which data to use for evaluation of RL Model
def split_data(data):

    X_train_test, X_valid =         train_test_split(data, train_size=0.67, test_size=0.33, shuffle=False)   
    X_train, X_test =         train_test_split(X_train_test, train_size=0.50, test_size=0.50, shuffle=False)

    return X_train, X_test, X_valid

X_train, X_test, X_valid =     split_data(data)


# Normalize the dataset subsets to make the model converge faster
scaler_type = MinMaxScaler

def get_feature_scalers(X, scaler_type=scaler_type):
    scalers = []
    for name in list(X.columns[X.columns != 'date']):
        scalers.append(scaler_type().fit(X[name].values.reshape(-1, 1)))
    return scalers

def get_scaler_transforms(X, scalers):
    X_scaled = []
    for name, scaler in zip(list(X.columns[X.columns != 'date']), scalers):
        X_scaled.append(scaler.transform(X[name].values.reshape(-1, 1)))
    X_scaled = pd.concat([pd.DataFrame(column, columns=[name]) for name, column in zip(list(X.columns[X.columns != 'date']), X_scaled)], axis='columns')
    return X_scaled

def scale_numpy_array(np_arr, scaler_type = scaler_type):
    return scaler_type().fit_transform(np_arr, (-1,1))

def normalize_data(X_train, X_test, X_valid):
    X_train_test = pd.concat([X_train, X_test], axis='index')
    X_train_test_valid = pd.concat([X_train_test, X_valid], axis='index')

    X_train_test_dates = X_train_test[['date']]
    X_train_test_valid_dates = X_train_test_valid[['date']]

    X_train_test = X_train_test.drop(columns=['date'])
    X_train_test_valid = X_train_test_valid.drop(columns=['date'])

    train_test_scalers =         get_feature_scalers(X_train_test, 
                            scaler_type=scaler_type)
    train_test_valid_scalers =         get_feature_scalers(X_train_test_valid, 
                            scaler_type=scaler_type)

    X_train_test_scaled =         get_scaler_transforms(X_train_test, 
                              train_test_scalers)
    X_train_test_valid_scaled =         get_scaler_transforms(X_train_test_valid, 
                              train_test_scalers)
    X_train_test_valid_scaled_leaking =         get_scaler_transforms(X_train_test_valid, 
                              train_test_valid_scalers)

    X_train_test_scaled =         pd.concat([X_train_test_dates, 
                   X_train_test_scaled], 
                  axis='columns')
    X_train_test_valid_scaled =         pd.concat([X_train_test_valid_dates, 
                   X_train_test_valid_scaled], 
                  axis='columns')
    X_train_test_valid_scaled_leaking =         pd.concat([X_train_test_valid_dates, 
                   X_train_test_valid_scaled_leaking], 
                  axis='columns')

    X_train_scaled = X_train_test_scaled.iloc[:X_train.shape[0]]
    X_test_scaled = X_train_test_scaled.iloc[X_train.shape[0]:]
    X_valid_scaled = X_train_test_valid_scaled.iloc[X_train_test.shape[0]:]
    X_valid_scaled_leaking = X_train_test_valid_scaled_leaking.iloc[X_train_test.shape[0]:]

    return (train_test_scalers, 
            train_test_valid_scalers, 
            X_train_scaled, 
            X_test_scaled, 
            X_valid_scaled, 
            X_valid_scaled_leaking)

train_test_scalers, train_test_valid_scalers, X_train_scaled, X_test_scaled, X_valid_scaled, X_valid_scaled_leaking =     normalize_data(X_train, X_test, X_valid)

class SimpleTradingEnv(gym.Env):
    
    metadata = {'render.modes': ['live', 'human', 'portfolio', 'none']}
    visualization = None

    def __init__(self, config=None):

        self.mode = config.get("mode")

        self.df_scaled = config.get("df_scaled").reset_index(drop=True)
        self.df_normal = config.get("df_normal").reset_index(drop=True)
        self.window_size = OBSERVATION_WINDOW_SIZE
        self.prices, self.features = self._process_data(self.df_scaled)
        # The shape of the observation is (window_size * features + environment_features) the environment_features are: quote_asset, base_asset, net_worth. The entire observation is flattened in a 1D np array. 
        # NOT USED ANYMORE, KEPT FOR REFERENCE
        # self.obs_shape = ((OBSERVATION_WINDOW_SIZE * self.features.shape[1] + 3),) 

        # The shape of the observation is number of candles to look back, and the number of features (candle_features) + 3 (quote_asset, base_asset, base_asset_short, net_worth)
        self.obs_shape = (self.window_size, self.features.shape[1] + 4)

        # Action space
        #self.action_space = spaces.Box(low=np.array([0, 0]), high=np.array([3.0, 1.0]), dtype=np.float32)
        self.action_space = spaces.MultiDiscrete([9, 4, 20])
        # Observation space
        self.observation_space = spaces.Box(low=-1, high=1, shape=self.obs_shape, dtype=np.float32)

        # Initialize the episode environment

        self._start_candle = self.window_size # We assume that the first observation is not the first row of the dataframe, in order to avoid the case where there are no calculated indicators.
        self._end_candle = len(self.features) - 1
        self._trading_fee = config.get("trading_fee")

        self._quote_asset = None
        self._base_asset = None
        self._done = None
        self._current_candle = None
        self._net_worth = None
        self._previous_net_worth = None
        self._buy_trades = None
        self._sell_trades = None        
        self._extra_reward = None

        # Array that will contain observation history needed for appending it to the observation space
        # It will contain observations consisting of the net_worth, base_asset and quote_asset as list of floats
        # Other features (OHLC + Indicators) will be appended to the current observation in the _get_observation method that takes the data directly from the available dataframe
        self._obs_env_history = None

        # Render and analysis data
        self._total_reward_accumulated = None
        self.portfolio_history = None
        self.trade_history = None
        self.positions = None
        self._first_rendering = None
        

    def reset(self):
        self._done = False
        self._current_candle = self._start_candle
        self._quote_asset = INITIAL_QUOTE_ASSET
        self._base_asset = INITIAL_BASE_ASSET
        self._base_asset_short = INITIAL_BASE_ASSET_SHORT
        self._net_worth = INITIAL_QUOTE_ASSET # at the begining our net worth is the initial quote asset
        self._net_worth_at_begin = INITIAL_QUOTE_ASSET # at the begining our net worth is the initial quote asset
        self._previous_net_worth = INITIAL_QUOTE_ASSET # at the begining our previous net worth is the initial quote asset
        self._total_reward_accumulated = 0.
        self._extra_reward = 0.
        self._first_rendering = True
        self.portfolio_history = []
        self.trade_history = []
        self.positions = []
        self._obs_env_history = []
        self._buy_trades = 0
        self._sell_trades = 0        
        
        self._initial_obs_data()

        return self._get_observation()

    def _take_action(self, action):
        self._done = False
        current_price = random.uniform(
            self.df_normal.loc[self._current_candle, "low"], self.df_normal.loc[self._current_candle, "high"])

        action_type = action[0]
        amount = ( action[1] + 1 ) * 0.25  #[0.25, 0.5 ... 1.0]
        limit = ( action[2] * 0.01 ) + 0.9 # limit factor 0.9, 0.91 ... 1.1
        
        if action_type == 0: # Buy Long Market
            # Buy % assets
            # Determine the maximum amount of quote asset that can be bought
            available_amount_to_buy_with = self._quote_asset / current_price
            # Buy only the amount that agent chose
            assets_bought = available_amount_to_buy_with * amount if self._quote_asset * amount > MIN_TRADE_SIZE else 0
            # Update the quote asset balance
            self._quote_asset -= assets_bought * current_price
            # Update the base asset
            self._base_asset += assets_bought
            # substract trading fee from base asset based on the amount bought
            self._base_asset -= self._trading_fee * assets_bought

            # Add to trade history the amount bought if greater than 0
            if assets_bought > 0:
                self._buy_trades += 1
                self.trade_history.append({'step': self._current_candle, 'type': 'BuyLong', 'subtype': 'Market', 'amount': assets_bought, 'price': current_price, 'total' : assets_bought * current_price, 'percent_amount': amount*100})
                pos = self._get_position('BTC')
                if pos != None:
                    pos['amount'] += assets_bought
                    pos['entry_price'] = (pos['total'] + assets_bought * current_price)/pos['amount']
                    pos['total'] = pos['amount'] * current_price
                else:
                    pos_id = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(32)])
                    self.positions.append({'id': pos_id, 'asset': 'BTC', 'type': 'Long', 'amount': assets_bought, 'entry_price': current_price, 'total' : assets_bought * current_price})

        elif action_type == 1: # Sell Long Market
            # Sell % assets
            # Determine the amount of base asset that can be sold
            amount_to_sell = self._base_asset * amount if self._base_asset * amount * current_price > MIN_TRADE_SIZE else 0
            received_quote_asset = amount_to_sell * current_price
            # Update the quote asset
            self._quote_asset += received_quote_asset
            # Update the base asset
            self._base_asset -= amount_to_sell
            
            # substract trading fee from quote asset based on the amount sold
            self._quote_asset -= self._trading_fee * received_quote_asset

            # Add to trade history the amount sold if greater than 0
            if amount_to_sell > 0:
                self._sell_trades += 1                
                pos = self._get_position('BTC')
                pos['amount'] -= amount_to_sell
                pos['total'] = pos['amount'] * current_price                

                profit = amount_to_sell * ( current_price - pos['entry_price'] - self._trading_fee * ( current_price + pos['entry_price'] ) )
                self._extra_reward += profit 

                self.trade_history.append({'step': self._current_candle, 'type': 'SellLong', 'subtype': 'Market', 'amount': amount_to_sell, 'price': current_price, 'total' : received_quote_asset, 'percent_amount': amount*100, 'profit': profit})

        elif action_type == 2: # Buy Long Limit
            limit_price = self.df_normal.loc[self._current_candle-1,"close"] * limit
            if limit_price > self.df_normal.loc[self._current_candle, "low"]:
                if limit_price < self.df_normal.loc[self._current_candle, "high"]:
                    available_amount_to_buy_with = self._quote_asset / limit_price
                    assets_bought = available_amount_to_buy_with * amount if self._quote_asset * amount > MIN_TRADE_SIZE else 0
                    # Update the quote asset balance
                    self._quote_asset -= assets_bought * limit_price
                    # Update the base asset
                    self._base_asset += assets_bought
                    # substract trading fee from base asset based on the amount bought
                    self._base_asset -= self._trading_fee * assets_bought

                    # Add to trade history the amount bought if greater than 0
                    if assets_bought > 0:
                        self._buy_trades += 1
                        self.trade_history.append({'step': self._current_candle, 'type': 'BuyLong', 'subtype': 'Limit', 'amount': assets_bought, 'price': limit_price, 'total' : assets_bought * limit_price, 'percent_amount': amount*100})
                        pos = self._get_position('BTC')
                        if pos != None:
                            pos['amount'] += assets_bought
                            pos['entry_price'] = (pos['total'] + assets_bought * limit_price)/pos['amount']
                            pos['total'] = pos['amount'] * limit_price
                        else:
                            pos_id = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(32)])
                            self.positions.append({'id': pos_id, 'asset': 'BTC', 'type': 'Long', 'amount': assets_bought, 'entry_price': limit_price, 'total' : assets_bought * limit_price})

        elif action_type == 3: # Sell Long Limit
            limit_price = self.df_normal.loc[self._current_candle-1,"close"] * limit
            if limit_price < self.df_normal.loc[self._current_candle, "high"]:
                if limit_price > self.df_normal.loc[self._current_candle, "low"]:
                    amount_to_sell = self._base_asset * amount if self._base_asset * amount * limit_price > MIN_TRADE_SIZE else 0
                    received_quote_asset = amount_to_sell * limit_price
                    # Update the quote asset
                    self._quote_asset += received_quote_asset
                    # Update the base asset
                    self._base_asset -= amount_to_sell
                    
                    # substract trading fee from quote asset based on the amount sold
                    self._quote_asset -= self._trading_fee * received_quote_asset

                    # Add to trade history the amount sold if greater than 0
                    if amount_to_sell > 0:
                        self._sell_trades += 1                
                        pos = self._get_position('BTC')
                        pos['amount'] -= amount_to_sell
                        pos['total'] = pos['amount'] * limit_price                

                        profit = amount_to_sell * ( limit_price - pos['entry_price'] - self._trading_fee * ( limit_price + pos['entry_price'] ) )
                        self._extra_reward += profit 

                        self.trade_history.append({'step': self._current_candle, 'type': 'SellLong', 'subtype': 'Limit', 'amount': amount_to_sell, 'price': limit_price, 'total' : received_quote_asset, 'percent_amount': amount*100, 'profit': profit})

        elif action_type == 4: # Buy Short Market
            available_amount_to_buy_with = self._quote_asset / current_price 
            short_assets_bought = available_amount_to_buy_with * amount if self._quote_asset * amount > MIN_TRADE_SIZE else 0
            # Update the quote asset balance
            self._quote_asset -= short_assets_bought * current_price            
            # Update the base asset
            self._base_asset_short += short_assets_bought
            # substract trading fee from base asset based on the amount bought
            self._base_asset_short -= self._trading_fee * short_assets_bought
            
            # Add to trade history the amount bought if greater than 0
            if short_assets_bought > 0:
                self.trade_history.append({'step': self._current_candle, 'type': 'BuyShort', 'subtype': 'Market', 'amount': short_assets_bought, 'price': current_price, 'total' : short_assets_bought * current_price, 'percent_amount': amount*100})
                pos = self._get_position('BTC','Short')
                if pos != None:
                    pos['amount'] += short_assets_bought * (1 - self._trading_fee)
                    pos['entry_price'] = (pos['total'] + short_assets_bought * (1 - self._trading_fee) * current_price)/pos['amount']
                    pos['total'] = pos['amount'] * current_price
                else:
                    pos_id = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(32)])
                    self.positions.append({'id': pos_id, 'asset': 'BTC', 'type': 'Short', 'amount': short_assets_bought * (1 - self._trading_fee), 'entry_price': current_price, 'total' : short_assets_bought * current_price * (1 - self._trading_fee)})
                    
        elif action_type == 5: # Sell Short Market
            # Sell % assets
            # Determine the amount of base asset that can be sold
            amount_to_sell = self._base_asset_short * amount if self._base_asset_short * amount * current_price > MIN_TRADE_SIZE else 0
            
            
            received_quote_asset = amount_to_sell * current_price

            # Update the base asset
            self._base_asset_short -= amount_to_sell
            
            # substract trading fee from quote asset based on the amount sold
            self._quote_asset -= self._trading_fee * received_quote_asset

            # Add to trade history the amount sold if greater than 0
            if amount_to_sell > 0:
                pos = self._get_position('BTC','Short')
                pos['amount'] -= amount_to_sell
                pos['total'] = pos['amount'] * current_price                

                profit = amount_to_sell * ( pos['entry_price'] - current_price  - self._trading_fee * ( current_price + pos['entry_price'] ) )

                self.trade_history.append({'step': self._current_candle, 'type': 'SellShort', 'subtype': 'Market', 'amount': amount_to_sell, 'price': current_price, 'total' : received_quote_asset, 'percent_amount': action[1]*10, 'profit': profit})
                
                # Update the quote asset
                self._quote_asset += amount_to_sell * ( 2 * pos['entry_price'] - current_price) 
                
                self._extra_reward += profit 

        elif action_type == 6: # Buy Short Limit
            limit_price = self.df_normal.loc[self._current_candle-1,"close"] * limit
            if limit_price > self.df_normal.loc[self._current_candle, "low"]:
                if limit_price < self.df_normal.loc[self._current_candle, "high"]:

                    available_amount_to_buy_with = self._quote_asset / limit_price 
                    short_assets_bought = available_amount_to_buy_with * amount if self._quote_asset * amount > MIN_TRADE_SIZE else 0
                    # Update the quote asset balance
                    self._quote_asset -= short_assets_bought * limit_price            
                    # Update the base asset
                    self._base_asset_short += short_assets_bought
                    # substract trading fee from base asset based on the amount bought
                    self._base_asset_short -= self._trading_fee * short_assets_bought
                    
                    # Add to trade history the amount bought if greater than 0
                    if short_assets_bought > 0:
                        self.trade_history.append({'step': self._current_candle, 'type': 'BuyShort', 'subtype': 'Limit', 'amount': short_assets_bought, 'price': limit_price, 'total' : short_assets_bought * limit_price, 'percent_amount': amount*100})
                        pos = self._get_position('BTC','Short')
                        if pos != None:
                            pos['amount'] += short_assets_bought * (1 - self._trading_fee)
                            pos['entry_price'] = (pos['total'] + short_assets_bought * (1 - self._trading_fee) * limit_price)/pos['amount']
                            pos['total'] = pos['amount'] * limit_price
                        else:
                            pos_id = ''.join([random.choice(string.ascii_letters + string.digits) for n in range(32)])
                            self.positions.append({'id': pos_id, 'asset': 'BTC', 'type': 'Short', 'amount': short_assets_bought * (1 - self._trading_fee), 'entry_price': limit_price, 'total' : short_assets_bought * limit_price * (1 - self._trading_fee)})
                    
        elif action_type == 7: # Sell Short Limit
            limit_price = self.df_normal.loc[self._current_candle-1,"close"] * limit
            if limit_price > self.df_normal.loc[self._current_candle, "low"]:
                if limit_price < self.df_normal.loc[self._current_candle, "high"]:

                    amount_to_sell = self._base_asset_short * amount if self._base_asset_short * amount * limit_price > MIN_TRADE_SIZE else 0
                    
                    received_quote_asset = amount_to_sell * limit_price

                    # Update the base asset
                    self._base_asset_short -= amount_to_sell
                    
                    # substract trading fee from quote asset based on the amount sold
                    self._quote_asset -= self._trading_fee * received_quote_asset

                    # Add to trade history the amount sold if greater than 0
                    if amount_to_sell > 0:
                        pos = self._get_position('BTC','Short')
                        pos['amount'] -= amount_to_sell
                        pos['total'] = pos['amount'] * limit_price                

                        profit = amount_to_sell * ( pos['entry_price'] - limit_price  - self._trading_fee * ( limit_price + pos['entry_price'] ) )

                        self.trade_history.append({'step': self._current_candle, 'type': 'SellShort', 'subtype': 'Limit', 'amount': amount_to_sell, 'price': limit_price, 'total' : received_quote_asset, 'percent_amount': action[1]*10, 'profit': profit})
                        
                        # Update the quote asset
                        self._quote_asset += amount_to_sell * ( 2 * pos['entry_price'] - limit_price) 
                        
                        self._extra_reward += profit                 

        else:
            # Hold ( action_type == 8 )
            #self.trade_history.append({'step': self._current_candle, 'type': 'Hold', 'amount': '0', 'price': current_price, 'total' : 0, 'percent_amount': amount*100})
            pass

        current_short_pos_value = self._base_asset_short * ( 2 * self._get_position('BTC','Short')['entry_price'] - current_price) if self._get_position('BTC','Short') != None else 0 

        # Update the current net worth
        self._net_worth = self._base_asset * current_price + self._quote_asset + current_short_pos_value

        self.portfolio_history.append({'step': self._current_candle, 'base_asset': self._base_asset, 'base_asset_short': self._base_asset_short, 'quote_asset': self._quote_asset, 'current_price': current_price, 'net_worth' : self._net_worth})

        self._extra_reward += 0.1 # small extra reward for every finished candle
        """
        print("#######################")
        print('step: ' + str(self._current_candle))
        print('current_price: ' +str(current_price))
        print('quote_asset: ' + str(self._quote_asset))
        print('base_asset: ' + str(self._base_asset))
        print('base_asset_short: ' + str(self._base_asset_short))
        print('current_short_pos_value: ' + str(current_short_pos_value))
        print('net_worth: ' + str(self._net_worth))
        print("------------------------")
        print('action_type: ' + str(action_type))
        print('amount: ' + str(amount))
        print('limit: ' + str(limit))
        pos = self._get_position('BTC','Short')
        if ( pos != None):
            print("------------------------")
            print('short pos amount: ' + str(pos['amount']) + ' / entry price: ' + str(pos['entry_price']) + ' total value: ' + str(pos['total']))
        """

    def step(self, action):
        """
        Returns the next observation, reward, done and info.
        """
        self._extra_reward = 0
        self._take_action(action)

        # Calculate reward comparing the current net worth with the previous net worth
        reward = self._net_worth - self._previous_net_worth
        #reward = self._extra_reward

        self._total_reward_accumulated += reward
        """
        print('reward: ' + str(reward))
        print('reward_accumulated: ' + str(self._total_reward_accumulated))
        print("#######################")
        print("\n")
        """

        # Update the previous net worth to be the current net worth after the reward has been applied
        self._previous_net_worth = self._net_worth

        obs = self._get_observation()
        # Update the info and add it to history data
        info = dict (
            total_reward_accumulated = self._total_reward_accumulated,
            net_worth = self._net_worth,
            quote_asset = self._quote_asset,
            base_asset = self._base_asset,
            base_asset_short = self._base_asset_short,
            last_action_type = self.trade_history[-1]['type'] if len(self.trade_history) > 0 else None,
            last_action_amount = self.trade_history[-1]['amount'] if len(self.trade_history) > 0 else None,
            current_step = self._current_candle,
            current_action = action,
            buy_trades=self._buy_trades,
            sell_trades=self._sell_trades,            
        )

        self._current_candle += 1

        # Update observation history
        self._obs_env_history.append([self._net_worth, self._base_asset, self._base_asset_short, self._quote_asset])

        self._done = self._net_worth <= self._net_worth_at_begin * MAX_LOSS_FACTOR or self._current_candle >= self._end_candle #(len(self.df_normal.loc[:, 'open'].values) - 30)# We assume that the last observation is not the last row of the dataframe, in order to avoid the case where there are no calculated indicators.

        if self._done:
            buy_and_hold_result = INITIAL_QUOTE_ASSET *  self.df_normal.loc[self._current_candle,"close"] / self.df_normal.loc[self.window_size,"close"]

            if(len(self.trade_history) == 0):
                print(self.mode,': I have finished the episode (',self._current_candle,' Candles) without trades. NetWorth: ', self._net_worth, " Buy&Hold Res: ", buy_and_hold_result)
            elif (next((sub for sub in self.trade_history if sub['type'] == 'SellLong'), None) == None):
                print(self.mode,': I have finished the episode (',self._current_candle,' Candles) without a complete round of buy AND sell for long. NetWorth: ', self._net_worth, " Buy&Hold Res: ", buy_and_hold_result)            
            elif (next((sub for sub in self.trade_history if sub['type'] == 'SellShort'), None) == None):
                print(self.mode,': I have finished the episode (',self._current_candle,' Candles) without a complete round of buy AND sell for short. NetWorth: ', self._net_worth, " Buy&Hold Res: ", buy_and_hold_result)
            else:
                print(self.mode,': I have finished the episode (',self._current_candle,' Candles) with ',len(self.trade_history),' trades. NetWorth: ', self._net_worth, " Buy&Hold Res: ", buy_and_hold_result)        
        return obs, reward, self._done, info


    def _get_observation(self):
        """
        Returns the current observation.
        """
        data_frame = self.features[(self._current_candle - self.window_size):self._current_candle]

        obs_env_history = np.array(self._obs_env_history).astype(np.float32)

        #TODO We definetely need to scale the observation history in a better way, this might influence training results
        # Doing it ad-hoc might change the scale of the min and max, thus changing the results
        obs_env_history = preprocessing.minmax_scale(obs_env_history, (-0.9,0.9)) 

        obs = np.hstack((data_frame, obs_env_history[(self._current_candle - self.window_size):self._current_candle]))

        return obs


    def render(self, mode='human', **kwargs):
        """
        Renders a plot with trades made by the agent.
        """
        
        if mode == 'human':
            print(f'Accumulated Reward: {self._total_reward_accumulated} ---- Current Net Worth: {self._net_worth}')
            print(f'Current Quote asset: {self._quote_asset} ---- Current Base asset: {self._base_asset}')
            print(f'Number of trades: {len(self.trade_history)}')
        
            if(len(self.trade_history) > 0):
                print(f'Last Action: {self.trade_history[-1]["type"]} {self.trade_history[-1]["amount"]} assets ({self.trade_history[-1]["percent_amount"]} %) at price {self.trade_history[-1]["price"]}, total: {self.trade_history[-1]["total"]}')
            print(f'--------------------------------------------------------------------------------------')
        elif mode == 'live':
            pass
            # if self.visualization == None:
            #     self.visualization = LiveTradingGraph(self.df_normal, kwargs.get('title', None))

            # if self._current_candle > OBSERVATION_WINDOW_SIZE:
            #     self.visualization.render(self._current_candle, self._net_worth, self.trade_history, window_size=OBSERVATION_WINDOW_SIZE)
        
        elif mode == 'portfolio':
            return self.positions, self.trade_history, self.portfolio_history, self.df_normal            

    def close(self):
        if self.visualization != None:
            self.visualization.close()
            self.visualization = None
         

    def _process_data(self, df_scaled):
        """
        Processes the dataframe into features.
        """
        
        prices = self.df_scaled.loc[:, 'close'].to_numpy(dtype=np.float32)

        data_frame = df_scaled.iloc[:, 1:] # drop first column which is date TODO: Should be probably fixed outside of this class
        # Convert df to numpy array
        return prices, data_frame.to_numpy(dtype=np.float32)

    def _initial_obs_data(self):
        for i in range(self.window_size - len(self._obs_env_history)):
            self._obs_env_history.append([self._net_worth, self._base_asset, self._base_asset_short, self._quote_asset])

    def _get_position(self,asset,posType="Long"):
        if len(self.positions) > 0:
            pos = next((item for item in self.positions if ((item['asset'] == asset) and (item['type'] == posType))), None)
            return pos
        else:
            return None
# Initialize Ray
if ray.is_initialized():
    ray.shutdown() # let's shutdown first any running instances of ray (don't confuse it with the cluster)
os.environ['RAY_record_ref_creation_sites'] = '1' # Needed for debugging when things go wrong
ray.init() 

try:
    available_gpu_in_cluster = ray.available_resources()['GPU']
except KeyError as e:
    available_gpu_in_cluster = 0

available_cpu_in_cluster = ray.available_resources()['CPU'] if ray.available_resources()['CPU']  else 0

# In the first version we assume that we have only one node cluster, so the allocation logic is based on that
# So the resources are maximized for one ray tune trial at a time
def find_optimal_resource_allocation(available_cpu, available_gpu):
    """
    Finds the optimal resource allocation for the agent based on the available resources in the cluster
    """
    # If we have GPU available, we allocate it all for the training, while creating as much workers as CPU cores we have minus one for the driver which holds the trainer
    if available_gpu > 0:
        return {
            'num_workers': available_cpu - 1,
            'num_cpus_per_worker': 1,
            'num_envs_per_worker': 1,
            'num_gpus_per_worker': 0,
            'num_cpus_for_driver': 1,
            'num_gpus' : available_gpu
        }
    # If we don't have GPU available, we allocate enough CPU cores for stepping the env (workers) while having enough for training maintaing a ratio of around 3 workers with 1 CPU to 1 driver CPU
    else:
        # according to the benchmark, we should allocate more workers, each with 1 cpu, letting the rest for the driver
        num_workers = min(int(math.floor((available_cpu  * 75) / 100)),4)
        num_cpu_for_driver = max(available_cpu - num_workers,2)
        return {
            'num_workers': num_workers,
            'num_cpus_per_worker': 1, # this should be enough for stepping an env at once
            'num_envs_per_worker': 1, # it doesn't seem to add any benefits to have more than one env per worker
            'num_gpus_per_worker': 0, # the inference is done pretty fast, so there is no need to use GPU, at least not when we run one trial at once
            'num_cpus_for_driver': num_cpu_for_driver,
            'num_gpus' : 0
        }

parallel_config = find_optimal_resource_allocation(available_cpu_in_cluster, 0) # Currently we are going to disable GPU ussage due to it's poor performance on a single instance cluster

training_config = {
            "trading_fee": TRADING_FEE,
            "df_normal": X_train,
            "df_scaled": X_train_scaled,
            "mode": "TRAIN",
}

test_config = {
            "trading_fee": TRADING_FEE,
            "df_normal": X_test,
            "df_scaled": X_test_scaled,
            "mode": "TEST",
}

eval_config = {
            "trading_fee": TRADING_FEE,
            "df_normal": X_valid,
            "df_scaled": X_valid_scaled,
            "mode": "VALIDATE",    
}

if ENV_NAME == 'SimpleTrading':
    training_env = SimpleTradingEnv(training_config)
    test_env = SimpleTradingEnv(test_config)
    eval_env = SimpleTradingEnv(eval_config)

    training_env_key = "SimpleTradingEnv-training-V01"
    test_env_key = "SimpleTradingEnv-testing-V01"
    eval_env_key = "SimpleTradingEnv-evaluating-V01"
    
tune.register_env(training_env_key, lambda _: training_env)
tune.register_env(test_env_key, lambda _: test_env)
tune.register_env(eval_env_key, lambda _: eval_env)

### custom ray callback    
class MyCallbacks(DefaultCallbacks):
    def on_episode_start(self, worker: RolloutWorker, base_env: BaseEnv,
                         policies: Dict[str, Policy],
                         episode: MultiAgentEpisode, **kwargs):
#        print("episode {} started".format(episode.episode_id))
        episode.user_data["net_worth"] = []
        episode.hist_data["net_worth"] = []
        episode.user_data["buys"] = []
        episode.user_data["sells"] = []
        episode.hist_data["buys"] = []
        episode.hist_data["sells"] = []

    def on_episode_step(self, worker: RolloutWorker, base_env: BaseEnv,
                        episode: MultiAgentEpisode, **kwargs):
        info = episode.last_info_for()
        if info is not None: # why None??
            net_worth = info['net_worth']
            buys = info['buy_trades']
            sells = info['sell_trades']
            episode.user_data["net_worth"].append(net_worth)
            episode.user_data["buys"].append(buys)
            episode.user_data["sells"].append(sells)         

    def on_episode_end(self, worker: RolloutWorker, base_env: BaseEnv,
                       policies: Dict[str, Policy], episode: MultiAgentEpisode,
                       **kwargs):
        net_worth = np.mean(episode.user_data["net_worth"])
#        print("episode {} ended with length {} and net worth {}".format(
#            episode.episode_id, episode.length, net_worth))
        episode.custom_metrics["net_worth"] = net_worth
        episode.hist_data["net_worth"] = episode.user_data["net_worth"]
        episode.custom_metrics["buys"] =  np.mean(episode.user_data["buys"])
        episode.hist_data["buys"] = episode.user_data["buys"]   
        episode.custom_metrics["sells"] =  np.mean(episode.user_data["sells"])
        episode.hist_data["sells"] = episode.user_data["sells"]           

    def on_sample_end(self, worker: RolloutWorker, samples: SampleBatch,
                      **kwargs):
        pass                      
#        print("returned sample batch of size {}".format(samples.count))

    def on_train_result(self, trainer, result: dict, **kwargs):
#        print("trainer.train() result: {} -> {} episodes".format(
#            trainer, result["episodes_this_iter"]))
        # you can mutate the result dict to add new fields to return
        pass
            #result["callback_ok"] = True

    def on_postprocess_trajectory(
            self, worker: RolloutWorker, episode: MultiAgentEpisode,
            agent_id: str, policy_id: str, policies: Dict[str, Policy],
            postprocessed_batch: SampleBatch,
            original_batches: Dict[str, SampleBatch], **kwargs):
            pass
#        print("postprocessed {} steps".format(postprocessed_batch.count))
        #if "num_batches" not in episode.custom_metrics:
         #   episode.custom_metrics["num_batches"] = 0
        #episode.custom_metrics["num_batches"] += 1  

# Create the ppo trainer configuration
ppo_trainer_config = {
        "env": training_env_key, # Ray will automatically create multiple environments and vectorize them if needed
        "horizon": len(X_train_scaled) - 30,
        "log_level": "WARN", #or INFO DEBUG
        "framework": "tf",
        #"eager_tracing": True,
        "ignore_worker_failures": True, 
        "num_workers": parallel_config.get("num_workers"), # Number of workers is per trial run, so the more we put the less parallelism we have
        "num_envs_per_worker": parallel_config.get("num_envs_per_worker"), # This influences also the length of the episode. the environment length will be split by the number of environments per worker
        "num_gpus": parallel_config.get("num_gpus"), # Number of GPUs to use in training (0 means CPU only). After a few experiments, it seems that using GPU is not helping
        "num_cpus_per_worker": parallel_config.get("num_cpus_per_worker"), # After some testing, seems the fastest way for this kind of enviroment. It's better to run more trials in parallel than to finish a trial with a couple of minutes faster. Because we can end trial earlier if we see that our model eventuall converge
        "num_cpus_for_driver": parallel_config.get("num_cpus_for_driver"), # Number of CPUs to use for the driver. This is the number of CPUs used for the training process.
        "num_gpus_per_worker": parallel_config.get("num_gpus_per_worker"), 
        #"rollout_fragment_length": ROLLOUT_FRAGMENT_LENGTH, # Size of batches collected from each worker. If num_envs_per_worker is > 1 the rollout value will be multiplied by num_envs_per_worker
        "train_batch_size": TRAIN_BATCH_SIZE, # Number of timesteps collected for each SGD round. This defines the size of each SGD epoch. the batch size is composed of fragments defined above
        "sgd_minibatch_size": SGD_MINIBATCH_SIZE,
        "batch_mode": BATCH_MODE,
        "vf_clip_param": 100, # Default is 10, but we increase it to 100 to adapt it to our rewards scale. It helps our value function to converge faster
        "lr": LEARNING_RATE,  # Hyperparameter grid search defined above
        "gamma": GAMMA,  # This can have a big impact on the result and needs to be properly tuned
        #"observation_filter": "MeanStdFilter",
        "model": {
        #    "fcnet_hiddens": FC_SIZE,  # Hyperparameter grid search defined above
            # "use_lstm": True,
            # "lstm_cell_size": 256,
            # "lstm_use_prev_action_reward": True,
            # "lstm_use_prev_action": True,
            
        },
        "evaluation_interval": 5,  # Run one evaluation step on every x `Trainer.train()` call.
        "evaluation_duration": 1,  # How many episodes to run evaluations for each time we evaluate.
        "evaluation_config": {
            "explore": True,  # We usually don't want to explore during evaluation. All actions have to be repeatable. Similar to deterministic = True, but on-policy algorithms can get better results with exploration.
            "env": test_env_key, # We need to define a new environment for evaluation with different parameters
        },
        "logger_config": {
            "logdir": res_dir,
            "type": "ray.tune.logger.UnifiedLogger",
        },
        "callbacks": MyCallbacks, #callback for custom metrics
    }


# ### Custom reporter to get progress in Superalgos
class CustomReporter(ProgressReporter):

    def __init__(
        self,
        max_report_frequency: int = 10, # in seconds
        location: str = "/tf/notebooks/",
    ):
        self._max_report_freqency = max_report_frequency
        self._last_report_time = 0
        self._location = location

    def should_report(self, trials, done=False):
        if time.time() - self._last_report_time > self._max_report_freqency:
            self._last_report_time = time.time()
            return True
        return done

    def report(self, trials, *sys_info):

        trial_status_dict = {}
        for trial in trials:
            trial_status_dict['status'] = trial.status
            trial_status_dict['name'] = trial.trial_id
            trial_status_dict['episodeRewardMax'] = int(trial.last_result['episode_reward_max']) if trial.last_result.get("episode_reward_max") else 0
            trial_status_dict['episodeRewardMean'] = int(trial.last_result['episode_reward_mean']) if trial.last_result.get("episode_reward_mean") else 0
            trial_status_dict['episodeRewardMin'] = int(trial.last_result['episode_reward_min']) if trial.last_result.get("episode_reward_min") else 0
            trial_status_dict['timestepsExecuted'] = int(trial.last_result['timesteps_total']) if trial.last_result.get("timesteps_total") else 0
            trial_status_dict['timestepsTotal'] = int(TIMESTEPS_TO_TRAIN)
        
        sys.stdout.write(json.dumps(trial_status_dict))
        sys.stdout.write('\n')

        # Write the results to JSON file
        with open(self._location + "training_results.json", "w+") as f:
            json.dump(trial_status_dict, f)
            f.close()
    
    def set_start_time(self, timestamp: Optional[float] = None):
        if timestamp is not None:
            self._start_time = time.time()
        else:
            self._start_time = timestamp

def print_quantstats_full_report(portfolio_history, df_normal, filename='dqn_quantstats'):
    #net_worth = pd.DataFrame(portfolio_history["net_worth"])#, orient='index')
    #net_worth = performance['net_worth'].iloc[window_size:]
    returns = portfolio_history["net_worth"].pct_change().iloc[1:]
    #returns = net_worth.pct_change().iloc[1:]
    benchmark=df_normal['close'].pct_change().iloc[1:]

    # WARNING! The dates are fake and default parameters are used!
    returns.index = pd.date_range(start=df_normal['date'].iloc[1], freq='1H', periods=returns.size)
    benchmark.index = pd.date_range(start=df_normal['date'].iloc[1], freq='1H', periods=benchmark.size)

    quantstats.reports.full(returns)
    #quantstats.reports.html(returns, benchmark=df_normal['close'].iloc[1:], output=True, download_filename=res_dir + filename + '.html')
    quantstats.reports.html(returns, benchmark=benchmark, output=True, download_filename=res_dir + filename + '.html')

# Printing a custom text to let Superalgos know that we are in a RL scenario
sys.stdout.write('RL_SCENARIO')
sys.stdout.write('\n')

# Run ray tune 
analysis = tune.run(
    run_or_experiment=ALGORITHM,
    name=EXPERIMENT_NAME,
    metric='episode_reward_mean',
    mode='max',
    stop={
        # An iteration is equal with one SGD round which in our case is equal to train_batch_size. If after X iterations we still don't have a good result, we stop the trial
        "timesteps_total": TIMESTEPS_TO_TRAIN      
    },
    config=ppo_trainer_config,
    num_samples=1,  # Have one sample for each hyperparameter combination. You can have more to average out randomness.
    keep_checkpoints_num=5,  # Keep the last X checkpoints
    checkpoint_freq=5,  # Checkpoint every X iterations (save the model)
    checkpoint_at_end=True, # Whether to checkpoint at the end of the experiment regardless of the checkpoint_freq
    verbose=1,
    local_dir=res_dir,  # Local directory to store checkpoints and results, we are using tmp folder until we move the notebook to a docker instance and we can use the same directory across all instances, no matter the underlying OS
    progress_reporter=CustomReporter(max_report_frequency=60,location=location),
    fail_fast=True,
    resume=RESUME
)

# Evaluate trained model restoring it from checkpoint
print("Search for best Trial")
best_trial = analysis.get_best_trial(metric="episode_reward_mean", mode="max", scope="all") 
print("Search for best Checkpoint")
best_checkpoint = analysis.get_best_checkpoint(best_trial, metric="episode_reward_mean")

try:
    print("best_checkpoint path: " + best_checkpoint.local_path)
except:
    pass

agent = ppo.PPOTrainer(config=ppo_trainer_config)
try:
    agent.restore(best_checkpoint)
except ValueError as e:
    print("The input data size doesnt fit the trained model network input size") #this may happen for the reforecaster, if the Test-Server did change its config, without renaming the Test-Server
    print("ValueError error: {0}".format(e))
    print(e)
    from shutil import rmtree
    rmtree(res_dir)
    print("deleted old result dir: " + res_dir)
    print("You can now run the script again")
    raise
except:
    print("An unexpected error occurred")
    raise

#policy = agent.get_policy()
#model = policy.model # ray.rllib.models.tf.complex_input_net.ComplexInputNetwork 
#model.flatten[0] #ray.rllib.models.tf.fcnet.FullyConnectedNetwork https://github.com/ray-project/ray/blob/master/rllib/models/tf/fcnet.py
#model.flatten[0].base_model.summary()
#model.post_fc_stack # ray.rllib.models.tf.fcnet.FullyConnectedNetwork
#model.post_fc_stack.base_model.summary()

json_dict = {}
episodes_to_run = 2

envs = [training_env, test_env, eval_env]

positions = []
trade_history = []
portfolio_history = []
df_normal = []

for iter, env in enumerate(envs):
    net_worths = []
    q_assets = []
    b_assets = []
    net_worths_at_end = []
    q_assets_at_end = []
    b_assets_at_end = []
    last_actions = []

    for i in range(episodes_to_run):
        episode_reward = 0
        done = False
        obs = env.reset() # we are using the evaluation environment for evaluation
        last_info = None
        while not done:
            action = agent.compute_single_action(obs, explore=True) # stochastic evaluation
            obs, reward, done, info = env.step(action)
            net_worths.append(info['net_worth']) # Add all historical net worths to a list to print statistics at the end of the episode
            q_assets.append(info['quote_asset']) # Add all historical quote assets to a list to print statistics at the end of the episode
            b_assets.append(info['base_asset']) # Add all historical base assets to a list to print statistics at the end of the episode
            episode_reward += reward
            last_info = info

        net_worths_at_begin = net_worths[0]
        net_worths_at_end.append(last_info['net_worth']) # Add all historical net worths to a list to print statistics at the end of the episode
        q_assets_at_end.append(last_info['quote_asset']) # Add all historical quote assets to a list to print statistics at the end of the episode
        b_assets_at_end.append(last_info['base_asset']) # Add all historical base assets to a list to print statistics at the end of the episode
        last_actions.append(last_info['current_action'])

    r1, r2, r3, r4 = env.render(mode='portfolio')
    positions.append(r1)
    trade_history.append(r2)
    portfolio_history.append(r3)
    df_normal.append(r4)

    json_dict_env = {}
    json_dict_env['meanNetWorth'] = np.mean(net_worths)
    json_dict_env['stdNetWorth'] = np.std(net_worths)
    json_dict_env['minNetWorth'] = np.min(net_worths)
    json_dict_env['maxNetWorth'] = np.max(net_worths)
    json_dict_env['stdQuoteAsset'] = np.std(q_assets)
    json_dict_env['minQuoteAsset'] = np.min(q_assets)
    json_dict_env['maxQuoteAsset'] = np.max(q_assets)
    json_dict_env['stdBaseAsset'] = np.std(b_assets)
    json_dict_env['minBaseAsset'] = np.min(b_assets)
    json_dict_env['maxBaseAsset'] = np.max(b_assets)
    json_dict_env['NetWorthAtBegin'] = net_worths_at_begin
    json_dict_env['meanNetWorthAtEnd'] = np.mean(net_worths_at_end)
    json_dict_env['stdNetWorthAtEnd'] = np.std(net_worths_at_end)
    json_dict_env['minNetWorthAtEnd'] = np.min(net_worths_at_end)
    json_dict_env['maxNetWorthAtEnd'] = np.max(net_worths_at_end)
    json_dict_env['current_action'] = {"type": int(last_actions[-1][0]), "amount": int((last_actions[-1][1]+ 1) * 25), "limit": int(last_actions[-1][2]+90)}

    print(f"NetWorthAtBegin / meanNetWorthAtEnd : {json_dict_env['NetWorthAtBegin']} / {json_dict_env['meanNetWorthAtEnd']}")
    json_dict[iter] = json_dict_env

    print_quantstats_full_report(portfolio_history=pd.DataFrame(r3), df_normal=pd.DataFrame(r4), filename='QS_'+str(iter)+'')


# Write the results to JSON file to be picked up by Superalgos
with open(location + "evaluation_results.json", "w+") as f:
    json.dump(json_dict, f)
    f.close()

pd_positions_0 = pd.DataFrame(positions[0])
pd_positions_1 = pd.DataFrame(positions[1])
pd_positions_2 = pd.DataFrame(positions[2])

pd_trade_history_0 = pd.DataFrame(trade_history[0])
pd_trade_history_1 = pd.DataFrame(trade_history[1])
pd_trade_history_2 = pd.DataFrame(trade_history[2])

pd_portfolio_history_0 = pd.DataFrame(portfolio_history[0])
pd_portfolio_history_1 = pd.DataFrame(portfolio_history[1])
pd_portfolio_history_2 = pd.DataFrame(portfolio_history[2])

pd_join_0 = pd.merge(pd_trade_history_0, pd_portfolio_history_0, how='right', left_on = 'step', right_on = 'step')
pd_join_1 = pd.merge(pd_trade_history_1, pd_portfolio_history_1, how='right', left_on = 'step', right_on = 'step')
pd_join_2 = pd.merge(pd_trade_history_2, pd_portfolio_history_2, how='right', left_on = 'step', right_on = 'step')

tic = "BTC train"
plt.figure(figsize=[15,9]);
plt.title(tic)
plt.plot(pd_join_0["step"],pd_join_0["net_worth"]/pd_join_0["net_worth"][0],label = "net_worth", color='black');
plt.plot(pd_join_0["step"],pd_join_0["current_price"]/pd_join_0["current_price"][0],label = "current_price", color='yellow');
plt.scatter(pd_trade_history_0[pd_trade_history_0['type'] == 'BuyLong']["step"], pd_trade_history_0[pd_trade_history_0['type'] == 'BuyLong']["price"]/pd_join_0["current_price"][0]*0.9, label='BuyLong', marker='^', color='lightgreen', alpha=1)
plt.scatter(pd_trade_history_0[pd_trade_history_0['type'] == 'SellLong']["step"], pd_trade_history_0[pd_trade_history_0['type'] == 'SellLong']["price"]/pd_join_0["current_price"][0]*1.1, label='SellLong', marker='v', color='magenta', alpha=1)
plt.scatter(pd_trade_history_0[pd_trade_history_0['type'] == 'BuyShort']["step"], pd_trade_history_0[pd_trade_history_0['type'] == 'BuyShort']["price"]/pd_join_0["current_price"][0]*1.1, label='BuyShort', marker='*', color='red', alpha=1)
plt.scatter(pd_trade_history_0[pd_trade_history_0['type'] == 'SellShort']["step"], pd_trade_history_0[pd_trade_history_0['type'] == 'SellShort']["price"]/pd_join_0["current_price"][0]*0.9, label='SellShort', marker='x', color='blue', alpha=1)
plt.xlabel('Steps')
plt.ylabel('Value normed to first step');
plt.legend()
plt.savefig(res_dir+tic.replace(" ", "_")+".png")
plt.show()


tic = "BTC test"
plt.figure(figsize=[15,9]);
plt.title(tic)
plt.plot(pd_join_1["step"],pd_join_1["net_worth"]/pd_join_1["net_worth"][0],label = "net_worth", color='black');
plt.plot(pd_join_1["step"],pd_join_1["current_price"]/pd_join_1["current_price"][0],label = "current_price", color='yellow');
plt.scatter(pd_trade_history_1[pd_trade_history_1['type'] == 'BuyLong']["step"], pd_trade_history_1[pd_trade_history_1['type'] == 'BuyLong']["price"]/pd_join_1["current_price"][0]*0.9, label='BuyLong', marker='^', color='lightgreen', alpha=1)
plt.scatter(pd_trade_history_1[pd_trade_history_1['type'] == 'SellLong']["step"], pd_trade_history_1[pd_trade_history_1['type'] == 'SellLong']["price"]/pd_join_1["current_price"][0]*1.1, label='SellLong', marker='v', color='magenta', alpha=1)
plt.scatter(pd_trade_history_1[pd_trade_history_1['type'] == 'BuyShort']["step"], pd_trade_history_1[pd_trade_history_1['type'] == 'BuyShort']["price"]/pd_join_1["current_price"][0]*1.1, label='BuyShort', marker='*', color='red', alpha=1)
plt.scatter(pd_trade_history_1[pd_trade_history_1['type'] == 'SellShort']["step"], pd_trade_history_1[pd_trade_history_1['type'] == 'SellShort']["price"]/pd_join_1["current_price"][0]*0.9, label='SellShort', marker='x', color='blue', alpha=1)
plt.xlabel('Steps')
plt.ylabel('Value normed to first step');
plt.legend()
plt.savefig(res_dir+tic.replace(" ", "_")+".png")
plt.show()

tic = "BTC validate"
plt.figure(figsize=[15,9]);
plt.title(tic)
plt.plot(pd_join_2["step"],pd_join_2["net_worth"]/pd_join_2["net_worth"][0],label = "net_worth", color='black');
plt.plot(pd_join_2["step"],pd_join_2["current_price"]/pd_join_2["current_price"][0],label = "current_price", color='yellow');
plt.scatter(pd_trade_history_2[pd_trade_history_2['type'] == 'BuyLong']["step"], pd_trade_history_2[pd_trade_history_2['type'] == 'BuyLong']["price"]/pd_join_2["current_price"][0]*0.9, label='BuyLong', marker='^', color='lightgreen', alpha=1)
plt.scatter(pd_trade_history_2[pd_trade_history_2['type'] == 'SellLong']["step"], pd_trade_history_2[pd_trade_history_2['type'] == 'SellLong']["price"]/pd_join_2["current_price"][0]*1.1, label='SellLong', marker='v', color='magenta', alpha=1)
plt.scatter(pd_trade_history_2[pd_trade_history_2['type'] == 'BuyShort']["step"], pd_trade_history_2[pd_trade_history_2['type'] == 'BuyShort']["price"]/pd_join_2["current_price"][0]*1.1, label='BuyShort', marker='*', color='red', alpha=1)
plt.scatter(pd_trade_history_2[pd_trade_history_2['type'] == 'SellShort']["step"], pd_trade_history_2[pd_trade_history_2['type'] == 'SellShort']["price"]/pd_join_2["current_price"][0]*0.9, label='SellShort', marker='x', color='blue', alpha=1)
plt.xlabel('Steps')
plt.ylabel('Value normed to first step');
plt.legend()
plt.savefig(res_dir+tic.replace(" ", "_")+".png")
plt.show()

# Cleanup
if ray.is_initialized():
    ray.shutdown()

# Tell Superalgos we finished
sys.stdout.write('RL_SCENARIO_END')
sys.stdout.write('\n')