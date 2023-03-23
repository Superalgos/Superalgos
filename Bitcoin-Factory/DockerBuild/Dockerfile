FROM tensorflow/tensorflow:latest-gpu-jupyter

RUN apt-get update && apt-get install -y python3-pip
RUN pip3 install --upgrade pip

RUN pip3 install -U scikit-learn
RUN pip3 install pandas
RUN pip3 install ray[all]  
RUN pip3 install torch
RUN pip3 install torchvision 
RUN pip3 install tabulate
RUN pip3 install tensorboard 
RUN pip3 install tensorflow 
RUN pip3 install sklearn 
RUN pip3 install gym==0.21.0 

# RUN nohup bash -c "ray start --head --port 6379 --num-gpus=1 &"  && sleep 8 # will be used for ray cluster

# RUN pip install notebook
# RUN pip install matplotlib
