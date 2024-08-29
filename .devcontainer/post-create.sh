#!/bin/bash

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0 

corepack enable pnpm
pnpm config set store-dir /home/vscode/pnpm/store

corepack use pnpm@9.6.0
pnpm install