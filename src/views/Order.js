import { Col, Row ,Card,Table,Button,Modal,InputNumber, Form, message, Select} from 'antd'
import {React,useEffect,useState} from 'react'
import moment from 'moment/moment';
import { useSelector } from 'react-redux';
import FormItem from 'antd/es/form/FormItem';
import { Option } from 'antd/es/mentions';

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // 0x 后面 40 个 0
function convert(n){
  //window.web
  if(!window.web) return 
  return window.web.web3.utils.fromWei(n,"ether");
}

function convertToWei(n){
  
  //window.web
  if(!window.web) return 
 
  let res=window.web.web3.utils.toWei(n, 'ether');
  
  return res
}

function converTime(t){
  return moment(t*1000).format("YYYY/MM/DD")
}
 

function getRenderOrder(order,type){
  if(!window.web) return []

  const account = window.web.account
  // 1. 排除 已经完成以及 取消订单
  let filterIds = [...order.CancelOrders,...order.FillOrder].map(item=>item.id)
  // console.log(filterIds)
  let pendingOrders = order.AllOrder.filter(item=> !filterIds.includes(item.id))
  // console.log(pendingOrders)
  if(type===1){
      return pendingOrders.filter(item=>item.user===account)
  }else{
      return pendingOrders.filter(item=>item.user!==account)
  }
}


export default function Order() {
  const order =useSelector(state=>state.order)
  const [messageApi,contextHolder] = message.useMessage();
  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      render:(timestamp)=><div>{converTime(timestamp)}</div>
  },
  {
    title: '获得类型',
    dataIndex: 'tokenGet',
    render:(tokenGet)=><div>{tokenGet===ETHER_ADDRESS?"ETH":"XYC代币"}</div>
  },
  {
      title: '获得数量',
      dataIndex: 'amountGet',
      render:(amountGet)=><b>{convert(amountGet)}</b>
  },
  {
    title: '支出类型',
    dataIndex: 'tokenGive',
    render:(tokenGive)=><div>{tokenGive===ETHER_ADDRESS?"ETH":"XYC代币"}</div>
  },
  {
      title: '支出数量',
      dataIndex: 'amountGive',
      render:(amountGive)=><b>{convert(amountGive)}</b>
  },
  ];
  const columns1 = [
    ...columns,
    
    {
        title: '操作',
        render:(item)=><Button type="primary" onClick = {()=>{
            const {exchange,account} = window.web
            exchange.methods
            .cancelOrder(item.id)
            .send({ from: account })
        }}>取消</Button>
    },
];
const columns2 = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      render:(timestamp)=><div>{converTime(timestamp)}</div>
  },
  {
    title: '卖家获得类型',
    dataIndex: 'tokenGet',
    render:(tokenGet)=><div>{tokenGet===ETHER_ADDRESS?"ETH":"XYC代币"}</div>
  },
  {
      title: '卖家获得数量',
      dataIndex: 'amountGet',
      render:(amountGet)=><b>{convert(amountGet)}</b>
  },
  {
    title: '卖家支出类型',
    dataIndex: 'tokenGive',
    render:(tokenGive)=><div>{tokenGive===ETHER_ADDRESS?"ETH":"XYC代币"}</div>
  },
  {
      title: '卖家支出数量',
      dataIndex: 'amountGive',
      render:(amountGive)=><b>{convert(amountGive)}</b>
  },
    
    {
        title: '操作',
        render:(item)=><Button danger onClick = {()=>{
            const {exchange,account} = window.web
            exchange.methods
            .fillOrder(item.id)
            .send({ from: account })
        }}>买入</Button>
    },
];

const [open, setOpen] = useState(false);
const [confirmLoading, setConfirmLoading] = useState(false);
const [orderData, setOrderData] = useState({amountGet:"0.001",amountGive:"0.001"});


const handleOk = async () => {
  debugger
   
  const {exchange,account} = window.web
  if(orderData.tokenGet===orderData.tokenGive){
    messageApi.error("兑换类型和支出类型不能一致！请重新选择！")
    return
  }
  console.log(orderData)
  setConfirmLoading(true);
  await exchange.methods.makeOrder(orderData.tokenGet,convertToWei(orderData.amountGet) ,orderData.tokenGive,convertToWei(orderData.amountGive))
  .send({from:account })
  .on('confirmation', function(confirmationNumber, receipt){
      messageApi.info("创建订单成功!");
      setOpen(false);
      setConfirmLoading(false);
  })
  .on('error', function(error, receipt) { // 如果交易被网络拒绝并带有交易收据，则第二个参数将是交易收据。
    messageApi.error(`交易失败!${error}`);
    setOpen(false);
     setConfirmLoading(false);
  });

  

}

 
//选择交易token相关
const [options, setOptions] = useState([]);
 


const [tokenAddress, setTokenAddress] = useState("");
useEffect(() => {
  if (window.web && window.web.token) {
    setTokenAddress(window.web.token.options.address);
  }
}, [window.web]);
useEffect(() => {
  setOptions([{ value: ETHER_ADDRESS, label: "ETH" }, { value: tokenAddress, label: "XYC代币" }]);
  
}, [tokenAddress]);

const  openCreatOrder=()=>{
  console.log(options)
  setOrderData({amountGet:"0.001",amountGive:"0.001"});
  setOpen(true);
}


const handleSelectChange1=(value)=>{
  setOrderData({...orderData,tokenGive:value})
}
const handleSelectChange2=(value)=>{
  setOrderData({...orderData,tokenGet:value})
}
  return (
    <div style={{marginTop:"10px"}}>
      {contextHolder}
      <Modal
        title="创建我的订单"
        open={open}
        onOk={()=>handleOk()}
        confirmLoading={confirmLoading}
        onCancel={
            () => {
            setOpen(false);
            setConfirmLoading(false);
        }}
        okText="确认"
        cancelText="取消"
      >
      
      
        <Form>
        <FormItem label="支出类型" >
        <Select value={orderData.tokenGive} onChange={handleSelectChange1}>
            {options.map((option) => (
              <Option key={option.label} value={option.value} >
                {option.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        
          <FormItem label="支出数量" >
          
              <InputNumber
                  style={{
                  width: 200,
                  }}
                  value={orderData.amountGive}
                  defaultValue="0.001"
                  min="0.001"
                  step="0.001"
                  onChange={(value)=>{setOrderData({...orderData,amountGive:value}) }}
                  stringMode
              />
          </FormItem>
          
          <FormItem label="兑换类型" >
          <Select value={orderData.tokenGet} onChange={handleSelectChange2}>
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          </FormItem>
          
          <FormItem label="兑换数量">
        
              <InputNumber
                  style={{
                  width: 200,
                  }}
                  value={orderData.amountGet}
                  defaultValue="0.001"
                  min="0.001"
                  step="0.001"
                  onChange={(value)=>{setOrderData({...orderData,amountGet:value}) }}
                  stringMode
              />
          </FormItem>
 
        </Form>
 
      </Modal>


      <Row>
        <Col span={8}>
          <Card title="已完成交易"   style={{ margin:10 }} hoverable={true} >
          <Table dataSource={order.FillOrder} columns={columns} rowKey={item=>item.id}/>;
          </Card>
        </Col>

        <Col span={8}>
          <Card title="交易中-我的订单"   style={{ margin:10 }} hoverable={true} >

          <Button type='primary' 
          style={{ marginBottom:10 }} 
          onClick={()=>openCreatOrder()} 
          >
            创建我的订单
          </Button>

          <Table dataSource={getRenderOrder(order,1)} columns={columns1} rowKey={item=>item.id}/>;
          </Card>
        </Col>

        <Col span={8}>
          <Card title="交易中-其他订单"   style={{ margin:10 }} hoverable={true} >
          <Table dataSource={getRenderOrder(order,2)} columns={columns2}  rowKey={item=>item.id}/>;
          </Card>
        </Col>
        
      </Row>


    </div>
  )
}
