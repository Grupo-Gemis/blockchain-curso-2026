// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract RegistroCertificados {
    enum Estado { Inexistente, Vigente, Revocado }
    struct Certificado {
        address emisor;
        Estado estado;
    }

    address public immutable autoridad;
    mapping(bytes32 => Certificado) private certificados;

    error NoAutorizado();
    error HuellaVacia();
    error YaRegistrado();
    error NoVigente();
    event CertificadoEmitido(bytes32 indexed huella, address indexed emisor);
    event CertificadoRevocado(bytes32 indexed huella, address indexed autor);

    constructor() {
        autoridad = msg.sender;
    }

    function emitir(bytes32 huella) external {
        if (msg.sender != autoridad) revert NoAutorizado();
        if (huella == bytes32(0)) revert HuellaVacia();
        if (certificados[huella].estado != Estado.Inexistente) revert YaRegistrado();
        certificados[huella] = Certificado(msg.sender, Estado.Vigente);
        emit CertificadoEmitido(huella, msg.sender);
    }

    function revocar(bytes32 huella) external {
        if (msg.sender != autoridad) revert NoAutorizado();
        if (certificados[huella].estado != Estado.Vigente) revert NoVigente();
        certificados[huella].estado = Estado.Revocado;
        emit CertificadoRevocado(huella, msg.sender);
    }

    function consultar(bytes32 huella) external view returns (address emisor, Estado estado) {
        Certificado storage certificado = certificados[huella];
        return (certificado.emisor, certificado.estado);
    }
}
