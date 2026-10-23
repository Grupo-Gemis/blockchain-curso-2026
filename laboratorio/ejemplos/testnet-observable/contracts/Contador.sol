// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Contador {
    uint256 public valor;
    address public immutable propietario;
    event ValorCambiado(address indexed autor, uint256 nuevoValor);
    error NoAutorizado();
    constructor() { propietario = msg.sender; }
    function incrementar() external { valor += 1; emit ValorCambiado(msg.sender, valor); }
    function reiniciar() external {
        if (msg.sender != propietario) revert NoAutorizado();
        valor = 0;
        emit ValorCambiado(msg.sender, valor);
    }
}
