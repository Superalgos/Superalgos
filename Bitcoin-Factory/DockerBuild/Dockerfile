# Use the official tensorflow latest with gpu and jupyter notebook
FROM tensorflow/tensorflow:2.10.0-jupyter

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt .

# Install the necessary libraries
RUN pip install -r requirements.txt


