"""
Loading the boston dataset and examining its target (label) distribution.
"""

# Load libraries
import numpy as np
import pylab as pl
from sklearn import datasets
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error
from sklearn.cross_validation import train_test_split
from sklearn.metrics import make_scorer
from sklearn import grid_search

################################
### ADD EXTRA LIBRARIES HERE ###
################################


def load_data():
	'''Load the Boston dataset.'''

	boston = datasets.load_boston()
	return boston


def explore_city_data(city_data):
      '''Calculate the Boston housing statistics.'''

	# Get the labels and features from the housing data
      housing_prices = city_data.target
      housing_features = city_data.data

	###################################
	### Step 1. YOUR CODE GOES HERE ###
	###################################
      print '\n'
	# Please calculate the following values using the Numpy library
	# Size of data?
      size_housing_prices = housing_prices.size
      print "Size housing prices: " + str(size_housing_prices)

	# Number of features?
      size_housing_features = housing_features.size
      print "Size housing features: " + str(size_housing_features)
    
	# Minimum value?
      min_housing_prices = np.min(housing_prices)
      print "Min housing prices: " + str(min_housing_prices)

	# Maximum Value?
      max_housing_prices = np.max(housing_prices)
      print "Max housing prices: " + str(max_housing_prices)

	# Calculate mean?
      mean_housing_prices = np.mean(housing_prices)
      print "Mean housing prices: " + format(mean_housing_prices, '.2f')
	
	# Calculate median?
      median_housing_prices = np.median(housing_prices)
      print "Median housing prices: " + format(median_housing_prices, '.2f')
	
	# Calculate standard deviation?
      std_housing_prices = np.std(housing_prices)
      print "Std housing prices: " + format(std_housing_prices, '.2f') + '\n'

def performance_metric(label, prediction):
	'''Calculate and return the appropriate performance metric.'''
     
      #1.10.7.2. Regression criteria
      #If the target is a continuous value, then for node m, representing a region R_m with N_m observations, a common criterion to minimise is the Mean Squared Error
      #source: http://scikit-learn.org/stable/modules/tree.html#regression-criteria

	###################################
	### Step 2. YOUR CODE GOES HERE ###
	###################################


	error = mean_squared_error(label, prediction)
	#print mean_squared_error
 
      #mean_squared_error(y_true, y_pred)
      #source: http://scikit-learn.org/stable/modules/model_evaluation.html#model-evaluation: 3.3.4.3. Mean squared error   
    
      #http://scikit-learn.org/stable/modules/classes.html#sklearn-metrics-metrics
	return error


def split_data(city_data):
      '''Randomly shuffle the sample set. Divide it into training and testing set.'''
    
    	# Get the features and labels from the Boston housing data
      X, y = city_data.data, city_data.target  

	###################################
	### Step 3. YOUR CODE GOES HERE ###
	###################################

      X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
      return X_train, y_train, X_test, y_test
    
    
      #X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)
      #source: http://scikit-learn.org/stable/modules/generated/sklearn.cross_validation.train_test_split.html

def learning_curve(depth, X_train, y_train, X_test, y_test):
	'''Calculate the performance of the model after a set of training data.'''

	# We will vary the training set size so that we have 50 different sizes
	sizes = np.linspace(1, len(X_train), 50)
	train_err = np.zeros(len(sizes))
	test_err = np.zeros(len(sizes))

	print "Decision Tree with Max Depth: "
	print depth

	for i, s in enumerate(sizes):

		# Create and fit the decision tree regressor model
		regressor = DecisionTreeRegressor(max_depth=depth)
		regressor.fit(X_train[:s], y_train[:s])

		# Find the performance on the training and testing set
		train_err[i] = performance_metric(y_train[:s], regressor.predict(X_train[:s]))
		test_err[i] = performance_metric(y_test, regressor.predict(X_test))


	# Plot learning curve graph
	learning_curve_graph(sizes, train_err, test_err)


def learning_curve_graph(sizes, train_err, test_err):
	'''Plot training and test error as a function of the training size.'''

	pl.figure()
	pl.title('Decision Trees: Performance vs Training Size')
	pl.plot(sizes, test_err, lw=2, label = 'test error')
	pl.plot(sizes, train_err, lw=2, label = 'training error')
	pl.legend()
	pl.xlabel('Training Size')
	pl.ylabel('Error')
	pl.show()


def model_complexity(X_train, y_train, X_test, y_test):
	'''Calculate the performance of the model as model complexity increases.'''

	print "Model Complexity: "

	# We will vary the depth of decision trees from 2 to 25
	max_depth = np.arange(1, 25)
	train_err = np.zeros(len(max_depth))
	test_err = np.zeros(len(max_depth))

	for i, d in enumerate(max_depth):
		# Setup a Decision Tree Regressor so that it learns a tree with depth d
		regressor = DecisionTreeRegressor(max_depth=d)

		# Fit the learner to the training data
		regressor.fit(X_train, y_train)

		# Find the performance on the training set
		train_err[i] = performance_metric(y_train, regressor.predict(X_train))

		# Find the performance on the testing set
		test_err[i] = performance_metric(y_test, regressor.predict(X_test))

	# Plot the model complexity graph
	model_complexity_graph(max_depth, train_err, test_err)


def model_complexity_graph(max_depth, train_err, test_err):
	'''Plot training and test error as a function of the depth of the decision tree learn.'''

	pl.figure()
	pl.title('Decision Trees: Performance vs Max Depth')
	pl.plot(max_depth, test_err, lw=2, label = 'test error')
	pl.plot(max_depth, train_err, lw=2, label = 'training error')
	pl.legend()
	pl.xlabel('Max Depth')
	pl.ylabel('Error')
	pl.show()


def fit_predict_model(city_data):
      '''Find and tune the optimal model. Make a prediction on housing data.'''

	# Get the features and labels from the Boston housing data
      X, y = city_data.data, city_data.target

	# Setup a Decision Tree Regressor
      regressor = DecisionTreeRegressor()

      parameters = {'max_depth':(1,2,3,4,5,6,7,8,9,10)}
 

	###################################
	### Step 4. YOUR CODE GOES HERE ###
	###################################

	# 1. Find the best performance metric
	# should be the same as your performance_metric procedure
	# http://scikit-learn.org/stable/modules/generated/sklearn.metrics.make_scorer.html

      #sklearn.metrics.make_scorer(score_func, greater_is_better=True, needs_proba=False, needs_threshold=False, **kwargs)
    
      scorer = make_scorer(mean_squared_error, greater_is_better=False)


	# 2. Use gridearch to fine tune the Decision Tree Regressor and find the best model
	# http://scikit-learn.org/stable/modules/generated/sklearn.grid_search.GridSearchCV.html
      #sklearn.grid_search.GridSearchCV
      #class sklearn.grid_search.GridSearchCV(estimator, param_grid, scoring=None, fit_params=None, n_jobs=1, iid=True, refit=True, cv=None, verbose=0, pre_dispatch='2*n_jobs', error_score='raise')

      reg = grid_search.GridSearchCV(regressor, parameters, scoring=scorer)

	# Fit the learner to the training data
      print "Final Model: "
      print reg.fit(X, y)
      print '\n' "Best parameter from grid search: " + str(reg.best_params_) +'\n'
    
      # Use the model to predict the output of a particular sample
      x = [11.95, 0.00, 18.100, 0, 0.6590, 5.6090, 90.00, 1.385, 24, 680.0, 20.20, 332.09, 12.13]
      y = reg.predict(x)
      print "House: " + str(x)
      print "Prediction: " + str(y)


def main():
	'''Analyze the Boston housing data. Evaluate and validate the
	performanance of a Decision Tree regressor on the Boston data.
	Fine tune the model to make prediction on unseen data.'''

	# Load data
	city_data = load_data()

	# Explore the data
	explore_city_data(city_data)

	# Training/Test dataset split
	X_train, y_train, X_test, y_test = split_data(city_data)

	# Learning Curve Graphs
	max_depths = [1,2,3,4,5,6,7,8,9,10]
	for max_depth in max_depths:
		learning_curve(max_depth, X_train, y_train, X_test, y_test)

	# Model Complexity Graph
	model_complexity(X_train, y_train, X_test, y_test)

	# Tune and predict Model
	fit_predict_model(city_data)


main()
