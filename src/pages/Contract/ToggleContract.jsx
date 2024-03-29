import { useEffect, useState, useRef, } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Form, Input, Button, Select, Card, Cascader, Row, Col } from 'antd';
import { useParams } from 'react-router-dom';
import styles from './contract.module.css';
// import useFetch from 'use-http';
// import styles from './Backtest.module.scss';

const { Option } = Select;

const socket = io(process.env.REACT_APP_WEBSOCKET_SERVER_URL, { transports: ['websocket'] });

socket.on('connect', function () {
  console.log('Connected');
});

export function ToggleContract() {
  const [profileForm] = Form.useForm();
  const [form] = Form.useForm();
  const formReadEl = useRef(null);
  const formWriteEl = useRef(null);
  const { address } = useParams();
  const [readFnList, setReadFnList] = useState([]);
  const [writeFnList, setWriteFnList] = useState([]);
  const [net, setNet] = useState('MAINNET');
  const [netOptions, setNetOptions] = useState([]);
  const [readResult, setReadResult] = useState([]);
  const [collection, setCollection] = useState(null);
  const [contractPathOption, setContractPathOption] = useState([]);

  async function fetchData() {
    const { collection } = await axios
      .get(`${process.env.REACT_APP_API_URL}/collections/${address}`)
      .then(function (response) {
        return response.data;
      });
    setCollection(collection);

    const abi = JSON.parse(collection.abi);
    const readFns = [];
    const writeFns = [];
    abi.forEach(item => {
      if (item.type !== "function") {
        return;
      }

      if (item.stateMutability === 'view') {
        readFns.push(item);
      } else {
        writeFns.push(item);
      }
    });
    setReadFnList(readFns);
    setWriteFnList(writeFns);
    profileForm.setFieldsValue(collection.profile);
    form.setFieldsValue(collection.mintConfig);

    setContractPathOption(collection.contractPathList);
    setNetOptions(
      [
        {
          label: 'Mainnet',
          value: 'MAINNET',
        },
        collection.ganacheContractAddress && {
          label: 'Ganache',
          value: 'GANACHE',
        },
        collection.ropstenContractAddress && {
          label: 'Ropsten',
          value: 'ROPSTEN',
        }
      ].filter(item => !!item)
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setReadResult(new Array(readFnList.length).fill(null));
  }, [net]);

  useEffect(() => {
    setReadResult(new Array(readFnList.length).fill(null));
  }, [readFnList]);

  const handleCall = (index) => async () => {
    const readFn = readFnList[index];
    const method = readFn.name;
    const fields = formReadEl.current[`${index}[]`];
    let values = []
    if (fields) {
      values = Array.from(fields.length > 0 ? fields : [fields]).map(input => input.value);
    }
    const data = await axios
      .get(`${process.env.REACT_APP_API_URL}/collections/${address}/call`, {
        params: {
          net: net,
          method: method,
          args: values,
        }
      })
      .then(function (response) {
        return response.data;
      });
    const newList = readResult.map((item, i) => {
      console.log(1111)
      if (i === index) {
        return data;
      }
      return item;
    });
    setReadResult(newList);
  }

  const handleSend = (index) => () => {
    const writeFn = writeFnList[index];
    const method = writeFn.name;
    const fields = formWriteEl.current[`${index}[]`];
    let values = []
    if (fields) {
      values = Array.from(fields.length > 0 ? fields : [fields]).map(input => input.value);
    }
    axios
      .get(`${process.env.REACT_APP_API_URL}/collections/${address}/send`, {
        params: {
          net: net,
          method: method,
          args: values,
        }
      })
      .then(function (response) {
        console.log('response', response)
        return response.data;
      });
  }

  const saveProfile = async (values) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/collections/${address}`, {
        profile: values
      })
      .then(function (response) {
        return response.data;
      });
  }

  const saveMint = async (values) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/collections/${address}`, {
        mintConfig: values
      })
      .then(function (response) {
        console.log('response', response)
        return response.data;
      });
  }

  const boot = async () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/collections/boot`, {
        address: address,
        net: net,
      })
      .then(function (response) {
        return response.data;
      });
  }

  const deploy = async (values) => {
    await axios
      .post(`${process.env.REACT_APP_API_URL}/collections/${address}/deploy`, values)
      .then(function (response) {
        console.log('response', response)
        return response.data;
      });
    fetchData();
  }

  // 需要这个吗
  const refresh = (fields, allFields) => {
    const newValue = {};
    fields.forEach(field => {
      const { name, value } = field;
      if (name[1] === 'args') {
        return;
      }

      const fnList = name[0].endsWith('Write') ? writeFnList : readFnList;
      const fn = fnList[value];
      newValue[name[0]] = {
        method: value,
        args: fn.inputs.map(inp => ('')),
      };
    });
    console.log('newValue', newValue)

    form.setFieldsValue(newValue)
    // forceUpdate()
  }

  return (
    <div>
      <h2>{collection?.contractName}</h2>
      <div>
        <Form form={profileForm} onFinish={saveProfile}>
          <Form.Item
            label="price"
            name="price"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="owner"
            name="owner"
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>

        <Form form={form} onFinish={saveMint} onFieldsChange={refresh}>
          <Form.Item
            label="读价格"
            name={['priceRead', 'method']}
          >
            <Select>
              {
                readFnList.map((item, index) => {
                  return <Option key={index} value={index}>{item.name}</Option>
                })
              }
            </Select>
          </Form.Item>
          <Form.List
            label="参数"
            name={['priceRead', 'args']}
          >
            {(fields) => (<>
              {fields.map((field, index) => (
                <Form.Item {...field} wrapperCol={{ offset: 2, span: 16 }}
                >
                  <Input />
                </Form.Item>
              ))}
            </>)}
          </Form.List>
          <Form.Item
            label="读owner"
            name={['ownerRead', 'method']}
          >
            <Select>
              {
                readFnList.map((item, index) => {
                  return <Option key={index} value={index}>{item.name}</Option>
                })
              }
            </Select>
          </Form.Item>
          <Form.List
            label="参数"
            name={['ownerRead', 'args']}
          >
            {(fields) => (<>
              {fields.map((field, index) => (
                <Form.Item {...field} wrapperCol={{ offset: 2, span: 16 }}
                >
                  <Input />
                </Form.Item>
              ))}
            </>)}
          </Form.List>
          {/* <Form.Item
            label="读公售开关"
            name={['saleActiveRead', 'method']}
          >
            <Select>
              {
                readFnList.map((item, index) => {
                  return <Option key={index} value={index}>{item.name}</Option>
                })
              }
            </Select>
          </Form.Item>
          <Form.List
            label="参数"
            name={['saleActiveRead', 'args']}
          >
            {(fields) => (<>
              {fields.map((field, index) => (
                <Form.Item {...field} wrapperCol={{ offset: 2, span: 16 }}
                >
                  <Input />
                </Form.Item>
              ))}
            </>)}
          </Form.List> */}
          <Form.Item
            label="写公售开关"
            name={['saleActiveWrite', 'method']}
          >
            <Select>
              {
                writeFnList.map((item, index) => {
                  return <Option key={index} value={index}>{item.name}</Option>
                })
              }
            </Select>
          </Form.Item>
          <Form.List
            label="参数"
            name={['saleActiveWrite', 'args']}
          >
            {(fields) => (<>
              {fields.map((field, index) => (
                <Form.Item {...field} wrapperCol={{ offset: 2, span: 16 }}
                >
                  <Input />
                </Form.Item>
              ))}
            </>)}
          </Form.List>
          <Form.Item
            label="mint"
            name={['mintWrite', 'method']}
          >
            <Select>
              {
                writeFnList.map((item, index) => {
                  return <Option key={index} value={index}>{item.name}</Option>
                })
              }
            </Select>
          </Form.Item>
          <Form.List
            label="参数"
            name={['mintWrite', 'args']}
          >
            {(fields) => (<>
              {fields.map((field, index) => (
                <Form.Item {...field} wrapperCol={{ offset: 2, span: 16 }}
                >
                  <Input />
                </Form.Item>
              ))}
            </>)}
          </Form.List>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>

        <div>
          <Form onFinish={deploy}>
            <Form.Item
              name="net"
              label="Net"
              rules={[{ required: true, message: 'Please input your net!' }]}
            >
              <Select>
                <Option value="ROPSTEN">Ropsten</Option>
                <Option value="GANACHE">Ganache</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="contractPath"
              label="ContractPath"
              rules={[{ required: true, message: 'Please input your contractPath!' }]}
            >
              <Cascader options={contractPathOption} placeholder="Please select" />
            </Form.Item>
            <Form.Item>
              <Button type="primary"
                htmlType="submit">部署</Button>
            </Form.Item>
          </Form>
        </div>

        <div className={styles.contractRoot}>
          <div className={styles.flex}>
            <Select value={net} onChange={setNet} options={netOptions}>
            </Select>
            <Button onClick={boot}>
              监听 {net}
            </Button>
          </div>
          <div className={styles.functionRoot}>
            <Card title="Read Contract" style={{ width: 400 }}>
              <form ref={formReadEl}>
                {
                  readFnList.map((item, index) => {
                    return <div key={index} className={styles.card}>
                      <span>{index + 1}</span>
                      <Button type="primary" >{item.name}</Button>
                      {
                        item.inputs.map((inp, i) => {
                          return <Form.Item key={i}
                            label={inp.name}
                          >
                            <Input name={`${index}[]`} placeholder={inp.type} />
                          </Form.Item>
                        })
                      }
                      <Button onClick={handleCall(index)}>Query</Button>
                      <div>=&gt; {item.outputs.map(op => `${op.name} ${op.type}`).join(', ')}</div>
                      <pre>{JSON.stringify(readResult[index], null, 2)}</pre>
                    </div>
                  })
                }
              </form>
            </Card>
            <Card title="Write Contract" style={{ width: 400 }}>
              <form ref={formWriteEl}>
                {
                  writeFnList.map((item, index) => {
                    return <div key={index} className={styles.card}>
                      <span>{index + 1}</span>
                      <Button type="primary">{item.name}</Button>
                      {
                        item.inputs.map((inp, i) => {
                          return <Form.Item key={i}
                            label={inp.name}
                          >
                            <Input name={`${index}[]`} placeholder={inp.type} />
                          </Form.Item>
                        })
                      }
                      <Button onClick={handleSend(index)}>Write</Button>
                    </div>
                  })
                }
              </form>
            </Card>
          </div>
          <div>
            <h4>Low level interactions</h4>
            <div>CALLDATA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToggleContract;
