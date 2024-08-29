#!/bin/bash

corepack enable pnpm
corepack use pnpm@9.6.0

pnpm config set store-dir /home/vscode/pnpm/store
pnpm install