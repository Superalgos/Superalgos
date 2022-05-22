FROM armswdev/tensorflow-arm-neoverse:latest
RUN pip install --upgrade --no-cache-dir notebook scikit-learn pandas
WORKDIR /tf
EXPOSE 8888
CMD ["jupyter", "notebook", "--port=8888", "--no-browser", "--ip=0.0.0.0"]