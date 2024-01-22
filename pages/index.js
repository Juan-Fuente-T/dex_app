
/*import React, { useEffect, useState } from "react";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";

export default function Home() {
  const { isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected) {
    return <div>Not connected. Please connect your account.</div>;
  }

  return (
    <div>
      <h1>Welcome to Your Exchange!</h1>
      <div>Your Exchange Balance: {useBalance().data?.toString()}</div>
    </div>
  );
}*/


import {
  ExchangeABI,
  ExchangeAddress,
} from "@/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { formatEther } from "viem/utils";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { waitForTransaction, writeContract, readContract } from "wagmi/actions";
import styles from "../styles/Home.module.css";
import { Inter } from "next/font/google";
//import { getBalance } from "viem/_types/actions/public/getBalance";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [amountOfToken, setAmountOfToken] = useState(0);
  const [amountOfLPTokens, setAmountOfLPTokens] = useState(0);
  const [userBalance, setUserBalance] = useState(null);
  const [exchangeBalance, setExchangeBalance] = useState(null);
  const [minTokensToReceive, setMinTokensToReceive] = useState(0);
  const [ethAmount, setEthAmount] = useState(0);
  const [amountEthToToken, setAmountEthToToken] = useState(0);
  /*const exchangeBalance = useBalance({
    address: ExchangeAddress,
  });*/
  const { data: contractBalance, error, isLoading } = useBalance({
    address: ExchangeAddress,
  });
  //const contractBalance = useBalance(address);
  // Obtén el balance del contrato en Wei
  //const contractBalanceInWei = await readContract({ address: ExchangeAddress, abi: ExchangeABI, functionName: getBalance, });

  // Conviértelo a Ether
  //const contractBalanceInEther = web3.utils.fromWei(contractBalanceInWei, 'ether');
  //


  async function balanceOf() {
    setLoading(true);

    try {
      console.log("Address", address)
      const result = await readContract({
        address: ExchangeAddress,
        abi: ExchangeABI,
        functionName: "balanceOf",
        args: [address], // Ajusta esto según tus necesidades
      });
      const result2 = await readContract({
        address: ExchangeAddress,
        abi: ExchangeABI,
        functionName: "totalSupply",
      });
      const totalSupply = result2 / 10n ** 18n;
      console.log("Result from Contract Call:", contractBalance);
      // Actualiza el estado del balance del usuario
      setExchangeBalance(result2)
      setUserBalance(result);
    } catch (error) {
      console.error(error);
      window.alert(error);
    } finally {
      setLoading(false);
    }
  }

  async function approveToken(amountOfToken) {
    try {
      const tx = await writeContract({
        address: ExchangeAddress, // Dirección del token ERC20
        abi: ExchangeABI, // ABI del token ERC20
        functionName: "approve", // Nombre de la función
        args: [ExchangeAddress, amountOfToken], // Argumentos de la función
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }
  //Exchange Balance: 99995000000000000Exchange BalanceXX: 0.109982533790375657
  async function addLiquidity(amountOfToken) {
    setLoading(true);

    try {
      let amountToken;
      let transformedAmountOfToken = Number(amountOfToken) * 10 ** 18;
      try {
        amountToken = await readContract({
          address: ExchangeAddress,
          abi: ExchangeABI,
          functionName: "getOutputAmountFromSwap",
          args: [transformedAmountOfToken, contractBalance.value, exchangeBalance]
        });
      } catch (error) {
        console.error("Error calculating amountToken:", error);
      }

      setAmountEthToToken(amountToken);
      console.log("ContractBalance", contractBalance.value);
      console.log("amountToken, contract balance, exchande balance", Number(amountOfToken), contractBalance.value, exchangeBalance);
      console.log("TransformedAmountToken", transformedAmountOfToken);
      console.log("amountEthToToken", amountEthToToken);

      approveToken(amountEthToToken);

      const tx = await writeContract({
        address: ExchangeAddress,
        abi: ExchangeABI,
        functionName: "addLiquidity",
        args: [transformedAmountOfToken], // Ajusta esto según tus necesidades
      });

      await waitForTransaction(tx);
      balanceOf();
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  async function removeLiquidity(amountOfLPTokens) {
    setLoading(true);

    try {
      const tx = await writeContract({
        address: ExchangeAddress,
        abi: ExchangeABI,
        functionName: "removeLiquidity",
        args: [amountOfLPTokens], // Ajusta esto según tus necesidades
      });

      await waitForTransaction(tx);
      balanceOf();
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  async function ethToTokenSwap(minTokensToReceive) {
    setLoading(true);

    try {
      console.log("ethAmount", ethAmount);
      console.log("minTokens", minTokensToReceive);
      const tx = await writeContract({
        address: ExchangeAddress,
        abi: ExchangeABI,
        functionName: "ethToTokenSwap",
        value: Number(ethAmount),
        arg: [minTokensToReceive], // Ajusta esto según tus necesidades
      });

      await waitForTransaction(tx);
      balanceOf();
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  async function tokenToEthSwap(tokensToSwap, minEthToReceive) {
    setLoading(true);

    try {
      const tx = await writeContract({
        address: ExchangeAddress,
        abi: ExchangeABI,
        functionName: "tokenToEthSwap",
        value: tokensToSwap, // Ajusta esto según tus necesidades
        args: [tokensToSwap, minEthToReceive], // Agregar args según la firma de la función en el contrato
      });

      await waitForTransaction(tx);
      balanceOf();
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    balanceOf();
    setIsMounted(true);
    return () => {
      // Realiza cualquier limpieza necesaria al desmontar el componente
    };
  }, []);

  if (!isMounted || !isConnected) {
    return (
      <div>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Your Exchange</title>
        <meta name="description" content="Your Exchange" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Your Exchange!</h1>
          <div className={styles.description}>
            Exchange Balance: {exchangeBalance !== null ? exchangeBalance.toString() : "Loading..."}
            Exchange BalanceXX: {exchangeBalance !== null ? (contractBalance.formatted).toString() : "Loading..."}
            {/*Exchange BalanceXX: {exchangeBalance !== null ? (contractBalance.formatted).toString() : "Loading..."}*/}
          </div>
          <div className={styles.description}>
            User Balance: {userBalance !== null ? userBalance.toString() : "Loading..."}
          </div>
          <input
            type="number"
            placeholder="Enter amount to add"
            value={amountOfToken}
            onChange={(e) => setAmountOfToken(e.target.value)}
          />
          <button onClick={() => addLiquidity(amountOfToken)}>Add Liquidity</button>
          <input
            type="number"
            placeholder="Enter amount to remove"
            value={amountOfLPTokens}
            onChange={(e) => setAmountOfLPTokens(e.target.value)}
          />
          <button onClick={() => removeLiquidity(amountOfLPTokens)}>Remove Liquidity</button>
          <input
            type="number"
            placeholder="Eth amount"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
          />
          <input
            type="number"
            placeholder="Min Tokens to receive"
            value={minTokensToReceive}
            onChange={(e) => setMinTokensToReceive(e.target.value)}
          />
          <button onClick={() => ethToTokenSwap(ethAmount, minTokensToReceive)}>ETH to Token Swap</button>
          <button onClick={() => tokenToEthSwap(1, 1)}>Token to ETH Swap</button>
          {/* Puedes agregar más botones o elementos UI según tus necesidades */}
        </div >
      </div >
    </div >
  );
}

//Posible estimacion de cantidad a recibir del swap
/*
// Esta función utiliza la lógica interna del contrato para estimar la cantidad de tokens que se recibirán en un swap de ETH a tokens.
async function estimateTokensToReceive(amountOfETH) {
  // Llama a la función del contrato para obtener la estimación.
  const tokensToReceive = await contract.methods.getOutputAmountFromSwap(
    amountOfETH,
    ethReserveBalance,  // Necesitarías obtener estos valores desde el contrato o de alguna otra manera.
    tokenReserveBalance
  ).call();

  // Devuelve la cantidad estimada de tokens.
  return tokensToReceive;
}

// Luego puedes llamar a esta función con la cantidad de ETH que el usuario desea intercambiar.
const estimatedTokens = await estimateTokensToReceive(2); // Cambia 2 por la cantidad que desees.
console.log("Estimación de tokens a recibir:", estimatedTokens);
*/