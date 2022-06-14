import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Table, Form, Input, Button, List } from 'antd';
import moment from 'moment';
import { Net } from '../../global.types.ts';
import styles from './Sniff.module.css';

const { TextArea } = Input;


const socket = io(process.env.REACT_APP_WEBSOCKET_SERVER_URL, {transports: ['websocket']});

socket.on('connect', function() {
    console.log('Connected');
});

export function Sniff() {
  const [profileForm] = Form.useForm();
  const [contracts, setContracts] = useState([]);
  const [data, setData] = useState([]);
  socket.on('sniff', (data)=>{
    setContracts([data, ...contracts])
  });

  const toggle = (item) => async (ev)=>{
    ev.preventDefault();
    await axios
      .put(`${process.env.REACT_APP_API_URL}/collections/sniff`, {
        toggle: item.bootedAt ? false : true,
        net: item.net,
      })
      .then(function (response) {
        return response.data;
      });
    fetchData();
  }

  const columns = [
    {
      title: 'Net',
      dataIndex: 'net',
      key: 'net',
    },
    {
      title: 'bootedAt',
      key: 'bootedAt',
      dataIndex: 'bootedAt',
      render: (text) => {
        return text && moment(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'action',
      render: (_, contract) => (
        <a onClick={toggle(contract)}>{contract.bootedAt ? '停止' : '监听'}</a>
      ),
    },
  ];

  async function fetchData() {
    const data = await axios
      .get(`${process.env.REACT_APP_API_URL}/collections/sniff`)
      .then(function (response) {
        return response.data;
      });

    if(data.configure){
      profileForm.setFieldsValue(data.configure.metadata);
    }
    setData(data);
  }

  async function fetchContracts() {
    const data = await axios
      .get(`${process.env.REACT_APP_API_URL}/collections/sniff/contracts`, {
        params: {
          net: Net.MAINNET,
        }
      })
      .then(function (response) {
        return response.data;
      });

    setContracts(data.contracts);
  }

  useEffect(() => {
    fetchData();
    fetchContracts();
  }, []);

  const saveProfile = async (values) => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/collections/sniff/configure`, values)
      .then(function (response) {
        return response.data;
      });
  }

  return (
    <div>
        <Form form={profileForm} onFinish={saveProfile}>
          <Form.Item
            label="Keywords"
            name="keywords"
          >
            <TextArea />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
        <Table rowKey="net" columns={columns} dataSource={data.list} pagination={false} />
        <List
          size="small"
          bordered
          dataSource={contracts}
          renderItem={(item, index) => <List.Item>
            <div className={styles.row}>
              <div>{contracts.length - index}</div>
              <div><a href={`https://etherscan.io/address/${item.address}`} target="_blank">ContractAddress</a></div>
              {/* <div><a href={`https://etherscan.io/tx/${item.transactionHash}`} target="_blank">TransactionHash</a></div> */}
              <div>{moment(parseInt(item.createdAt)).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
            </List.Item>}
        />
    </div>
  );
}

export default Sniff;
