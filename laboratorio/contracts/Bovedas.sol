// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// INSEGURO A PROPÓSITO. Exclusivamente para una red local de laboratorio.
contract BovedaVulnerable {
    mapping(address => uint256) public saldos;
    function depositar() external payable { saldos[msg.sender] += msg.value; }
    function retirar() external {
        uint256 monto = saldos[msg.sender]; require(monto > 0, "Sin saldo");
        (bool ok,) = msg.sender.call{value:monto}(""); require(ok, "Fallo envio");
        saldos[msg.sender] = 0; // Efecto demasiado tarde: permite reentrada.
    }
}
contract BovedaSegura is ReentrancyGuard {
    mapping(address => uint256) public saldos;
    function depositar() external payable { saldos[msg.sender] += msg.value; }
    function retirar() external {
        // TODO: implementar retiro con checks-effects-interactions y guard.
        // Comprobar saldo, resultado del envío y preservación de la contabilidad.
        revert("Pendiente de implementar");
    }
}
interface IBoveda {function depositar() external payable; function retirar() external;}
// Receptor adversarial acotado para probar SOLO las bóvedas desplegadas localmente.
contract ReceptorPrueba {
    IBoveda public immutable objetivo; uint256 public intentos;
    constructor(address destino) { objetivo = IBoveda(destino); }
    function probar() external payable { objetivo.depositar{value:msg.value}(); objetivo.retirar(); }
    receive() external payable {
        if (intentos < 3) { intentos++; try objetivo.retirar() {} catch {} }
    }
}
