import web3 from "./web3";
import PrntNFTFactory from "./build/PrntNFTFactory.json";

const instance = new web3.eth.Contract(
  PrntNFTFactory.abi,
  // '0x2623f548483559D26ECE2677BfD4a0CC26C67330'
  // '0x6cB1ee5BE066d72c76a3b96428F0578002A0F571'
  // '0x1d095Ce09b8Df62570D7Db99DCddF523EdA6521c'
  // '0x48039c0c6E330B585077b21F3fB5824A02423a5b'
  // '0x5f0a21380D7D55D35619A0aF4D8B4f9F303B2A3f'
  // '0x0b2D677D91fe9304bB7e94e2f3b07faC4592dB83'

  //rinkeby
  // "0x208392eC796237E3BFb6F4B1e86999F596371a5A"
  // "0xdD7bC45E25a86E1DbC1AE1477330461cF7fB2875"
  // "0x6B77712429DEebB0B2551668cD9314B5d52ECdD2"

  // mumbai
  // "0x5f0a21380D7D55D35619A0aF4D8B4f9F303B2A3f"

  // Mainnet v1.0
  "0xd99F08EA1a899dE0A1d56B90CC2672B0f2dB3F24"
);

export default instance;
