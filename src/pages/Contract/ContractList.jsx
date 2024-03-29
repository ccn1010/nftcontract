import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Table, Tag, Space, Form, Input, Button, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;

const mintTypes = {
  'schedule': 
    {
      path: 'schedule',
      label: '定时',
    },
  'toggle': 
  {
    path: 'toggle',
    label: '开关'
  },
}



const socket = io(process.env.REACT_APP_WEBSOCKET_SERVER_URL, {transports: ['websocket']});

socket.on('connect', function() {
    console.log('Connected');
});

export function ContractList() {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [address, setAdress] = useState();
  // socket.on('backtest', (...args)=>{
  //   console.log('aaa', args)
  // });

  const remove = (address) => async (ev)=>{
    ev.preventDefault();
    await axios
      .delete(`${process.env.REACT_APP_API_URL}/collections/${address}`)
      .then(function (response) {
        // handle success
        return response.data;
      });
    fetchData();
  }

  const columns = [
    {
      title: 'Contract',
      dataIndex: 'contractName',
      key: 'contractName',
      render: (text, record) => <a target="_blank" href={`/${mintTypes[record.mintType].path}/${record.contractAddress}`} rel="noreferrer">{text}</a>,
    },
    {
      title: 'mintType',
      dataIndex: 'mintType',
      key: 'mintType',
      render: (text, record) => mintTypes[text].label,
    },
    {
      title: 'createdAt',
      key: 'createdAt',
      render: (text) => (
        moment(text).format('YYYY-MM-DD HH:mm:ss')
      ),
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'action',
      render: (_, record) => (
        <a onClick={remove(record.contractAddress)}>删除</a>
      ),
    },
  ];

  async function fetchData() {
    const data = await axios
      .get(`${process.env.REACT_APP_API_URL}/collections`)
      .then(function (response) {
        // handle success
        return response.data;
      });

      console.log('lllll', data)
    setData(data.collections);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const onFinish = async (values) => {
    console.log('Success:', values);
    await axios
        .post(`${process.env.REACT_APP_API_URL}/collections`, values)
        .then(function (response) {
          // handle success
          return response.data;
        });
    await fetchData();
  };

  return (
    <div>
      <div>
          {/* {JSON.stringify(data, null, 2)} */}
          <Form form={form} name="horizontal_login" layout="inline" onFinish={onFinish}>
            <Form.Item
              name="address"
              rules={[{ required: true, message: 'Please input your address!' }]}
            >
              <Input style={{ width: 420 }} placeholder="contract address" />
            </Form.Item>
            <Form.Item
              name="mintType"
              rules={[{ required: true, message: 'Please input your mintType!' }]}
            >
              <Select style={{ width: 120 }}>
                <Option value="schedule">定时</Option>
                <Option value="toggle">开关</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                  type="primary"
                  htmlType="submit"
                >
                  添加
              </Button>
            </Form.Item>
          </Form>

          <Table rowKey="contractAddress" columns={columns} dataSource={data} />
      </div>
    </div>
  );
}

export default ContractList;
