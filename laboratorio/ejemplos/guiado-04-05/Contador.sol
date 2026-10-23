// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Ejemplo completo para observar y ejecutar en las unidades 04 y 05.
contract Contador {
    // El valor se guarda en el estado del contrato, no en la página web.
    uint256 public valor;
    address public immutable propietario;

    event ValorCambiado(address indexed autor, uint256 nuevoValor);
    error NoAutorizado();

    constructor() {
        // Quien envía la creación queda registrado como propietario.
        propietario = msg.sender;
    }

    function incrementar() external {
        // Cualquier cuenta puede sumar una unidad.
        valor += 1;
        emit ValorCambiado(msg.sender, valor);
    }

    function reiniciar() external {
        // El permiso se comprueba aquí, aunque el pedido venga de otra página.
        if (msg.sender != propietario) revert NoAutorizado();
        valor = 0;
        emit ValorCambiado(msg.sender, valor);
    }
}
