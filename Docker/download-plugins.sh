#!/bin/bash
set -eo pipefail

# Set magic variables for dirs
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__root="$(cd "$(dirname "${__dir}")" && pwd)"

FOLDERS=(Algorithmic-Trading Data-Mining Foundations Machine-Learning Network Portfolio-Management TensorFlow Trading-Signals)
for i in "${FOLDERS[@]}"; do
    cd "${__root}/Plugins"
    curl -Ls "https://github.com/Superalgos/${i}-Plugins/archive/refs/heads/develop.zip" -o "${i}.zip"
    unzip "${i}"
    mv "${i}-Plugins-develop" "${i}"
    rm "${i}.zip"
done
