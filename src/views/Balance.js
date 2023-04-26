import { Button ,Row,Col,Card,Statistic,Modal, InputNumber,message } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import {React,useState} from 'react'
import { useSelector } from 'react-redux';
import {useDispatch} from 'react-redux'
import { loadBalanceData  } from '../redux/slices/balanceSlice'

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


export default function Balance() {

    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch()
    
    const{
        TokenWallet,
        TokenExchange,
        EtherWallet,
        EtherExchange,
    }=
    useSelector(state=>state.balance)

    const [mTitle, setmTitle] = useState("");
    const [operateType, setOperateType] = useState("");
    const [opValue, setOpValue] = useState('0.001');
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('输入存入的金额');

    const showModal = (tokenType) => {

        if (tokenType === "depositEth") {
            setOpValue("0.001")
            setOperateType("depositEth")
            setmTitle("存入以太坊")
            setModalText('输入存入的金额,单位:eth')
            setOpen(true);
        }
        if (tokenType === "withdrawEth") {
            setOpValue("0.001")
            setOperateType("withdrawEth")
            setmTitle("提现以太坊")
            setModalText('输入提现的金额,单位:eth')
            setOpen(true);
        }

        if (tokenType === "depositXYC") {
            setOpValue("0.001")
            setOperateType("depositXYC")
            setmTitle("存入XYC代币")
            setModalText('输入存入XYC代币个数')
            setOpen(true);
        }
        if (tokenType === "withdrawXYC") {
            setOpValue("0.001")
            setOperateType("withdrawXYC")
            setmTitle("提现XYC代币")
            setModalText('输入提现XYC代币个数')
            setOpen(true);
        }

    };
    const handleOk = async () => {
        
        if(operateType==="depositEth"){
            debugger
            const {exchange,account} = window.web
            setModalText('交易进行中..');
            setConfirmLoading(true);
            
            await exchange.methods.depositEther()
            .send({from:account,value:convertToWei(opValue)})
            .on('confirmation', function(confirmationNumber, receipt){
                setOpen(false);
                setConfirmLoading(false);
                dispatch(loadBalanceData(window.web))
            })
            .on('error', function(error, receipt) { // 如果交易被网络拒绝并带有交易收据，则第二个参数将是交易收据。
                messageApi.info(`交易失败!${error}`);
                setOpen(false);
                setConfirmLoading(false);
                dispatch(loadBalanceData(window.web))
            });
            
        }

        if(operateType==="withdrawEth"){
            
            const {exchange,account} = window.web
            setModalText('交易进行中..');
            setConfirmLoading(true);
            
            await exchange.methods.withdrawEther(convertToWei(opValue))
            .send({from:account})
            .on('confirmation', function(confirmationNumber, receipt){
                setOpen(false);
                setConfirmLoading(false);
                dispatch(loadBalanceData(window.web))
            })
            .on('error', function(error, receipt) { // 如果交易被网络拒绝并带有交易收据，则第二个参数将是交易收据。
                messageApi.info(`交易失败!${error}`);
                setOpen(false);
                setConfirmLoading(false);
                dispatch(loadBalanceData(window.web))
            });
            
        }


        if(operateType==="depositXYC"){
            
            const {exchange,account,token} = window.web
            setModalText('交易进行中..');
            setConfirmLoading(true);
            console.log(window.web.token.options.address)

            //授权
            await token.methods.approve(exchange.options.address,convertToWei(opValue))
            .send({from:account})
            .on('confirmation', function(confirmationNumber, receipt){
                messageApi.info(`授权成功!${opValue}个XYC代币！！`);
            })
            .on('error', function(error, receipt) { // 如果交易被网络拒绝并带有交易收据，则第二个参数将是交易收据。
                setOpen(false);
                 setConfirmLoading(false);
                 dispatch(loadBalanceData(window.web))
                return
            });

            
             //转到交易所
             await exchange.methods.depositToken(token.options.address,convertToWei(opValue))
             .send({from:account})
             .on('confirmation', function(confirmationNumber, receipt){
                messageApi.info(`交易成功！`);
                 setOpen(false);
                 setConfirmLoading(false);
                 dispatch(loadBalanceData(window.web))
             })
             .on('error', function(error, receipt) { // 如果交易被网络拒绝并带有交易收据，则第二个参数将是交易收据。
                 messageApi.info(`交易失败!${error}`);
                 setOpen(false);
                 setConfirmLoading(false);
                 dispatch(loadBalanceData(window.web))
             });
            
            
        }


        if(operateType==="withdrawXYC"){
            
            const {exchange,account,token} = window.web
            setModalText('交易进行中..');
            setConfirmLoading(true);
            
            await exchange.methods.withdrawToken(token.options.address,convertToWei(opValue))
            .send({from:account})
            .on('confirmation', function(confirmationNumber, receipt){
                messageApi.info(`交易成功！`);
                setOpen(false);
                setConfirmLoading(false);
                dispatch(loadBalanceData(window.web))
            })
            .on('error', function(error, receipt) { // 如果交易被网络拒绝并带有交易收据，则第二个参数将是交易收据。
                messageApi.info(`交易失败!${error}`);
                setOpen(false);
                setConfirmLoading(false);
                dispatch(loadBalanceData(window.web))
            });
            
        }
 
    };

  return (
    <div>
         
        <Modal
        title={mTitle}
        open={open}
        onOk={()=>handleOk()}
        confirmLoading={confirmLoading}
        onCancel={
            () => {
            setOpen(false);
            setConfirmLoading(false);
        }}
      >
        <InputNumber
            style={{
            width: 200,
            }}
            value={opValue}
            defaultValue="0.001"
            min="0.001"
            step="0.001"
            onChange={(value)=>{setOpValue(value)}}
            stringMode
        />
        <p>{modalText}</p>
      </Modal>


        <Row>
                <Col span={6}>
                    <Card hoverable={true}>
                        <Statistic
                            title="钱包中以太币"
                            value={convert(EtherWallet)}
                            precision={3}
                            valueStyle={{
                                color: '#3f8600',
                            }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable={true}>
                        <Statistic
                            title="钱包中的XYC代币"
                            value={convert(TokenWallet)}
                            precision={3}
                            valueStyle={{
                                color: '#1677ff',
                            }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable={true}>
                        <Statistic
                            title="交易所中以太币"
                            value={convert(EtherExchange)}
                            precision={3}
                            valueStyle={{
                                color: '#faad14',
                            }}
                        />
                        <Button
                            style={{
                            margin: 0,
                            }}
                            onClick={()=>showModal("depositEth")}
                        >
                            存入
                        </Button>
                        <Button
                            style={{
                            margin: 16,
                            }}
                            onClick={()=>showModal("withdrawEth")}
                        >
                            提现
                        </Button>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card hoverable={true}>
                        <Statistic
                            title="交易所中XYC代币"
                            value={convert(TokenExchange)}
                            precision={3}
                            valueStyle={{
                                color: '#cf1332',
                            }}
                        />
                        <Button
                            style={{
                            margin: 0,
                            }}
                            onClick={()=>showModal("depositXYC")} 
                        >
                            存入
                        </Button>
                        <Button
                            style={{
                            margin: 16,
                            }}
                            onClick={()=>showModal("withdrawXYC")} 
                        >
                            提现
                        </Button>
                    </Card>
                </Col>
            </Row>
    </div>
  )
}
