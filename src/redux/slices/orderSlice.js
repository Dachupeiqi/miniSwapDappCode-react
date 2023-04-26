/*
 * @作者: kerwin
 */
import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // 0x 后面 40 个 0


const orderSlice = createSlice({
    name:"order", // type: balance/get,,,
    initialState:{
         CancelOrders:[],
         FillOrder:[],
         AllOrder:[]

    },
    reducers:{
        setCancelOrders(state,action){
            state.CancelOrders = action.payload
        },
        setFillOrder(state,action){
            state.FillOrder = action.payload
        },
        setAllOrder(state,action){
            state.AllOrder = action.payload
        } 
    }
})

export const {setCancelOrders,setFillOrder,setAllOrder} = orderSlice.actions

export default orderSlice.reducer;
//balanceSlice.action


export const loadCancelOrders = createAsyncThunk(
    "order/loadCancelOrders",
    async (data, {dispatch}) =>{

       const {exchange}= data
        
        
       let res=await exchange.getPastEvents("Cancel",{
        fromBlock:0,
        toBlock:"latest"
       })
       const cancelOrders=res.map(item=>item.returnValues)
       
       dispatch(setCancelOrders(cancelOrders))
    }
)

export const loadAllOrders = createAsyncThunk(
    "order/loadAllOrders",
    async (data, {dispatch}) =>{

       const {exchange}= data
        
        
       let res=await exchange.getPastEvents("Order",{
        fromBlock:0,
        toBlock:"latest"
       })
       const allOrders=res.map(item=>item.returnValues)
       
       dispatch(setAllOrder(allOrders))
    }
)

export const loadFillOrders = createAsyncThunk(
    "order/loadFillOrders",
    async (data, {dispatch}) =>{

       const {exchange}= data
        
        
       let res=await exchange.getPastEvents("Trade",{
        fromBlock:0,
        toBlock:"latest"
       })
       const fillOrder=res.map(item=>item.returnValues)
       
       dispatch(setFillOrder(fillOrder))
    }
)