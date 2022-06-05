import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Table, Tag, Space, Form, Input, Button, Select } from 'antd';
import moment from 'moment';

const { Option } = Select;


const socket = io(process.env.REACT_APP_WEBSOCKET_SERVER_URL, {transports: ['websocket']});

socket.on('connect', function() {
    console.log('Connected');
});

export function Free() {
  const [data, setData] = useState([]);
  // socket.on('backtest', (...args)=>{
  //   console.log('aaa', args)
  // });

  const toggle = (item) => async (ev)=>{
    ev.preventDefault();
    await axios
      .put(`${process.env.REACT_APP_API_URL}/collections/free`, {
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
      render: (_, record) => (
        <a onClick={toggle(record)}>{record.bootedAt ? '停止' : '监听'}</a>
      ),
    },
  ];

  async function fetchData() {
    const data = await axios
      .get(`${process.env.REACT_APP_API_URL}/collections/free`)
      .then(function (response) {
        return response.data;
      });

    setData(data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
        <Table rowKey="net" columns={columns} dataSource={data} />
    </div>
  );
}

export default Free;
