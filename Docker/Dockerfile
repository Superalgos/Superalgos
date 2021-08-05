FROM python:3-slim
ENV NODE_VERSION=node_16.x
ENV PYTHONUNBUFFERED 1
RUN apt-get update \
    && apt-get install -y curl gnupg lsb-release build-essential \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
    && DISTRO="$(lsb_release -s -c)" \
    && echo "deb https://deb.nodesource.com/$NODE_VERSION $DISTRO main" | tee /etc/apt/sources.list.d/nodesource.list \
    && echo "deb-src https://deb.nodesource.com/$NODE_VERSION $DISTRO main" | tee -a /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN mkdir -p Data-Storage Log-Files My-Workspaces \
    && groupadd superalgos \
    && useradd --no-log-init -m -g superalgos superalgos \
    && chown -R superalgos:superalgos /app
USER superalgos
RUN node setup noShortcuts
EXPOSE 34248
EXPOSE 18041
VOLUME ["/app/Data-Storage", "/app/Log-Files", "/app/My-Workspaces"]
ENTRYPOINT ["node", "run", "noBrowser"]
