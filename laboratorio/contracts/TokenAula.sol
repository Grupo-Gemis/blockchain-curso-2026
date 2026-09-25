// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenAula is ERC20 {
    constructor(address receptor) ERC20("Token Aula", "AULA") {
        // TODO: emitir 1.000.000 AULA al receptor, respetando decimals().
        // No agregar una función pública de emisión adicional.
    }
}
