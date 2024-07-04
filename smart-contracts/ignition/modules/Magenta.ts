import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "@nomicfoundation/hardhat-ignition-ethers";
import { ethers } from "hardhat";

const MagentaModule = buildModule("MagentaModule", (m) => {
    const timely: string = '0xf2277ef211a646e18E4921B348F235B5239b83F0';
    const router: string = '0x39cd4db6460d8b5961f73e997e86ddbb7ca4d5f6';
    const magentaFee = ethers.parseEther('0');
    const magenta = m.contract("Magenta", [timely, router, magentaFee]);

    return { magenta };
});

export default MagentaModule;