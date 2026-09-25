// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Contador {
    uint256 public valor;
    address public immutable propietario;
    event ValorCambiado(address indexed autor, uint256 nuevoValor);
    error NoAutorizado();
    error PendienteDeImplementacion();

    constructor() { propietario = msg.sender; }

    function incrementar() external {
        // TODO: incrementar valor y emitir ValorCambiado.
        revert PendienteDeImplementacion();
    }

    function reiniciar() external {
        // TODO: permitir solo al propietario, reiniciar y emitir el evento.
        revert PendienteDeImplementacion();
    }
}
