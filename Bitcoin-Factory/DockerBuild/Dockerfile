FROM tensorflow/tensorflow:latest-gpu-jupyter

RUN pip install -U scikit-learn
RUN pip install pandas
RUN pip install ray[all]  
RUN pip install torch
RUN pip install torchvision 
RUN pip install tabulate
RUN pip install tensorboard 
RUN pip install tensorflow 
RUN pip install sklearn 
RUN pip install gym==0.21.0 

# RUN nohup bash -c "ray start --head --port 6379 --num-gpus=0 &"  && sleep 8 # will be used for ray cluster

# RUN pip install notebook
# RUN pip install matplotlib
