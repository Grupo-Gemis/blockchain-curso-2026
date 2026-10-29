#!/bin/zsh
cd "${0:A:h}" || exit 1
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 || exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "No se encontró npm. Instalá Node.js 24 LTS y volvé a abrir este archivo."
  read -r "?Presioná Enter para cerrar."
  exit 1
fi
npm start
resultado=$?
if [[ $resultado -ne 0 ]]; then
  read -r "?Presioná Enter para cerrar."
fi
exit $resultado
