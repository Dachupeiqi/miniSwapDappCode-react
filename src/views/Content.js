import React, { useEffect, useState } from "react";
import Web3 from "web3"
import tokenjson from "../build/XycToken.json"
import exchangejson from "../build/Exchange.json"
import Balance from "./Balance";
import Order from "./Order";
import {useDispatch} from 'react-redux'

import { loadBalanceData  } from '../redux/slices/balanceSlice'
import { loadAllOrders, loadCancelOrders, loadFillOrders } from "../redux/slices/orderSlice";
import { Button, Layout, Typography } from "antd";
export default function Content(){

    const[userAddress,setUserAddress]=useState("")
    const dispatch = useDispatch()



    async function loadData(web){
        //获取资产信息
        dispatch(loadBalanceData(web))

        //获取订单信息
        if(web!==undefined){
            dispatch(loadCancelOrders(web))
            dispatch(loadAllOrders(web))
            dispatch(loadFillOrders(web))
        }
        web.exchange.events.Order({},(error,event)=>{
            dispatch(loadAllOrders(web))
        })
        web.exchange.events.Cancel({},(error,event)=>{
            dispatch(loadCancelOrders(web))
        })
        web.exchange.events.Trade({},(error,event)=>{
            dispatch(loadFillOrders(web))
            dispatch(loadBalanceData(web))
        })
        
    }
    

    async function ConnectWallet(){
        debugger
        var web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
         //先授权
         let accounts = await web3.eth.requestAccounts()
         setUserAddress(accounts[0])
         localStorage.setItem("userAddress",accounts[0]);
         
        //获取链接后的合约
        let web=await initWeb()
        web={...web,account:accounts[0]}
        window.web=web   //window全局对象
        loadData(web)
        
    }

    async function DisconnectWallet(){
      
        localStorage.removeItem("userAddress")
        // eslint-disable-next-line no-restricted-globals
        location.reload()
        
    }

      useEffect(()=>{

        async function load(){
            
           
            if(localStorage.getItem("userAddress")!==null){
                let web=await initWeb()
                web={...web,account:localStorage.getItem("userAddress")}
                window.web=web
                loadData(web)
            }
        }
        
        load()
        

      },[dispatch])

    async function initWeb(){
        var web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
      
        //获取networkId
        const networkId = await web3.eth.net.getId();

        const tokenabi = tokenjson.abi
        const tokenaddress = tokenjson.networks[networkId].address
        const token = await new web3.eth.Contract(tokenabi,tokenaddress);


        const exchangeabi = exchangejson.abi
        const exchangeaddress = exchangejson.networks[networkId].address
        const exchange = await new web3.eth.Contract(exchangeabi,exchangeaddress);

        // console.log(exchange)
        return {
            web3,
            token,
            exchange
        }

    }

    return(

        <div>
            <Layout> 
                <Layout.Header>
                     {

                     localStorage.getItem("userAddress")===null?
                     <Button style={{marginRight:"10px"}} onClick={()=>ConnectWallet()} >ConnectWallet</Button>
                        :<Button style={{marginRight:"10px"}} onClick={()=>DisconnectWallet()} >DisconnectWallet</Button>
                    }

                     <Typography.Text >
                        <span style={{color:"#ffffff"}}>{localStorage.getItem("userAddress")}</span>
                    </Typography.Text> 
                </Layout.Header> 
                </Layout>
            <Balance></Balance>
            <Order></Order>
        </div>

    )
}