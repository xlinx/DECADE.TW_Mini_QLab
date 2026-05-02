import React, {useState, useRef, useEffect} from 'react';
import * as cron from 'cron';
import { Cron } from 'react-js-cron'
import 'react-js-cron/styles.css'
import {
    Table,
    Button,
    Space,
    InputNumber,
    Input,
    Typography,
    Card,
    Tag,
    Tooltip,
    Progress,
    Switch,
    Upload,
    message, Flex
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    StepForwardOutlined,
    StopOutlined,
    PlusCircleOutlined,
    RetweetOutlined,
    DownloadOutlined,
    UploadOutlined, MinusCircleOutlined, DeleteRowOutlined, UsergroupDeleteOutlined
} from '@ant-design/icons';
import {useStoreX} from "../model/StoreX.jsx";
import {ISOStringX} from "../model/xlinx.js";

const {Text} = Typography;
Date.prototype.toISOString = function () {
    let pad =(n)=>(n < 10)?'0' + n:n;
    let hours_offset = this.getTimezoneOffset() / 60;
    let offset_date = this.setHours(this.getHours() - hours_offset);
    let symbol = (hours_offset >= 0) ? "-" : "+";
    // let time_zone = symbol+pad(Math.abs(hours_offset))+ ":00";

    return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) +
        'T' + pad(this.getUTCHours()) +
        ':' + pad(this.getUTCMinutes()) +
        ':' + pad(this.getUTCSeconds()) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
    // + time_zone;
};
const MiniQ = ({group,allAction}) => {
    const {setTX_JSON_CMD} = useStoreX();

    const defaultQ=[
        {
            id: ISOStringX(),
            number: '-1',
            name: '/cue/god/',
            wait: 1000,
            cron: '* * * 1 2 3',
            status: 'idle',
            percent: 0
        }
    ]
    let defaultQobj={}
    defaultQobj[group]=defaultQ

    // 1. Initial State with LocalStorage Loading
    const [dataSource, setDataSource] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('qlab_cues'));
        if(saved){
            return saved[group]?saved[group]:defaultQ
        }else{
            return defaultQ
        }

    });
    const [nowQ, setnowQ] = useState(dataSource[0]);
    const [isRunning, setIsRunning] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const stopSignal = useRef(false);

    // 2. Sync to LocalStorage on change
    useEffect(() => {
        let saving = JSON.parse(localStorage.getItem('qlab_cues'));
        console.log('saving',saving,Boolean(saving))
        if(saving){
            saving[group]= dataSource
            localStorage.setItem('qlab_cues', JSON.stringify(saving));
        }else{
            localStorage.setItem('qlab_cues', JSON.stringify(defaultQobj));
        }


    }, [dataSource]);

    // --- Import / Export Logic ---
    const exportToJson = () => {
        // We clean the status/percent before exporting so the file is "clean"
        const cleanData = dataSource.map(({status, percent, ...rest}) => ({
            ...rest,
            status: 'idle',
            percent: 0
        }));
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "cue_list.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        message.success("Cue list exported successfully");
    };

    const handleImport = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (Array.isArray(json)) {
                    setDataSource(json);
                    message.success("Cue list imported successfully");
                }
            } catch (err) {
                message.error("Invalid JSON file", err);
            }
        };
        reader.readAsText(file);
        return false; // Prevent auto-upload
    };

    // --- Sequence Engine ---
    async function runSequence() {
        if (isRunning) return;
        setIsRunning(true);
        stopSignal.current = false;

        const execute = async () => {
            setDataSource(prev => prev.map(item => ({...item, status: 'idle', percent: 0})));
            for (let i = 0; i < dataSource.length; i++) {
                if (stopSignal.current) return false;
                const currentCue = dataSource[i];
                updateCueState(currentCue.id, {status: 'running'});

                const startTime = Date.now();
                while (Date.now() - startTime < currentCue.wait) {
                    if (stopSignal.current) return false;
                    const elapsed = Date.now() - startTime;
                    updateCueState(currentCue.id, {percent: Math.min(Math.floor((elapsed / currentCue.wait) * 100), 99)});
                    await new Promise(r => setTimeout(r, 40));
                }
                updateCueState(currentCue.id, {status: 'complete', percent: 100});
                setTX_JSON_CMD(`${currentCue.name}` + Date.now())
                setnowQ(currentCue)
                console.log(currentCue.name)

            }
            return true;
        };

        let finishedNaturally = await execute();
        while (isLooping && finishedNaturally && !stopSignal.current) {
            finishedNaturally = await execute();
        }
        setIsRunning(false);
    };

    const updateCueState = (id, updates) => {
        setDataSource(prev => prev.map(item => item.id === id ? {...item, ...updates} : item));
    };

    const moveCue = (index, direction) => {
        const newData = [...dataSource];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newData.length) {
            [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
            setDataSource(newData);
        }
    };
    const clockSeq = [0x1F55B, 0x1F550, 0x1F551, 0x1F552, 0x1F553, 0x1F554, 0x1F555, 0x1F556, 0x1F557, 0x1F558, 0x1F559, 0x1F55A, 0x1F55B]

    const columns = [
        {
            title: 'Status',
            dataIndex: 'status',
            width: 90,
            render: (s) => (s === 'running' ? <Tag color="#52c41a">LIVE</Tag> : s === 'complete' ?
                <Tag color="#108ee9">DONE</Tag> : <Tag>IDLE</Tag>)
        },
        {
            title: 'No.',
            dataIndex: 'number',
            width: 100,
            render: (v, r) => <Input variant="borderless" value={v}
                                     onChange={e => updateCueState(r.id, {number: e.target.value})}
                                     style={{color: '#1890ff', fontWeight: 'bold'}}/>
        },
        {
            title: 'Command',
            dataIndex: 'name',
            render: (val, record) => (
                <Input variant='filled' value={val} style={{color: '#fff'}}
                       onChange={
                           e => {
                               if (!e.target.value.endsWith("/")) {
                                   e.target.value += '/'
                               }
                               updateCueState(record.id, {name: e.target.value})
                           }
                       }
                />
            )
        }

        , {
            title: '定時 (分 時 日 月 週 年)',
            dataIndex: 'cron',
            width: 150,
            render: (v, r) => {
                return <>
                    <Input variant="outlined" value={v}
                           onChange={e => updateCueState(r.id, {cron: e.target.value})}
                           style={{color: '#1890ff', fontWeight: 'bold' ,textAlign:'center'}}/>
                    <Tag> {cron.validateCronExpression(v).valid ? cron.sendAt(v).toISO() : '??'} </Tag>


                </>
            }
        },
        {
            title: 'Wait (ms)',
            dataIndex: 'wait',
            width: 120,
            render: (v, r) => <InputNumber min={0} value={v} step={500}
                                           onChange={val => updateCueState(r.id, {wait: val})}/>
        },
        {
            title: 'Progress',
            dataIndex: 'percent',
            width: 250,
            render: (percent, record) => (
                <Flex justify="space-around" align="center" style={{height: '100%'}}>
                    <Progress
                        percent={percent}
                        percentPosition={{align: 'center', type: 'inner'}}
                        steps={5}
                        format={percent => `${percent.toString().padStart(3, '0')}% ${String.fromCodePoint(clockSeq[Math.round(percent / 100 * 12)])}️ ${Math.round(percent / 100 * record.wait)} `}
                        size={[10, 20]}
                        status={record.status === 'running' ? 'active' : 'normal'}
                        strokeColor={record.status === 'complete' ? '#52c41a' : '#c110e9'}
                        showInfo={true}
                    />
                </Flex>
            )
        },
        {
            title: 'Actions', width: 180, render: (_, r, idx) => (
                <Space>
                    <Tooltip title="Insert Below"><Button icon={<PlusCircleOutlined/>} size="small" onClick={() => {
                        const newData = [...dataSource];
                        let newCue= {...defaultQ[0]}
                        newCue.id=ISOStringX()
                        newCue.name=newCue.name+new Date().toISOString()+'/'
                        newData.splice(idx + 1, 0, newCue);
                        setDataSource(newData);
                    }}/></Tooltip>
                    <Button icon={<ArrowUpOutlined/>} size="small" disabled={idx === 0 || isRunning}
                            onClick={() => moveCue(idx, 'up')}/>
                    <Button icon={<ArrowDownOutlined/>} size="small"
                            disabled={idx === dataSource.length - 1 || isRunning} onClick={() => moveCue(idx, 'down')}/>
                    <Button danger icon={<DeleteOutlined/>} size="small"
                            onClick={() => setDataSource(prev => prev.filter(i => i.id !== r.id))}
                            disabled={isRunning||dataSource.length===1}/>
                </Space>
            )
        }
    ];
    function stopSequence(){
        stopSignal.current = true;
        setIsRunning(false);
        setDataSource(prev => prev.map(i => ({...i, status: 'idle', percent: 0})))
    }
    useEffect(() => {
        switch (allAction) {
            case "GO":
                runSequence();
                break;
            case "STOP":
                stopSequence();
                break;


        }
    }, [allAction]);
    return (
        <>
            <Card style={{background: '#141414', borderColor: 'rgb(95 56 2)', marginBottom: 20}}
                  title={
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <Space size="middle">

                              <Space.Compact>
                              <Button type="primary" size="large" icon={<StepForwardOutlined/>} onClick={()=>{runSequence()}}
                                      loading={isRunning}
                                      style={{background: '#52c41a', borderColor: '#52c41a', width: 130}}>GO-One</Button>
                              <Button danger size="large" icon={<StopOutlined/>} onClick={() => {
                                  stopSequence()
                              }} disabled={!isRunning}>STOP</Button>

                              </Space.Compact>
                              <Switch
                                  checkedChildren="LOOP:ON"
                                  unCheckedChildren="LOOP:OFF"
                                  checked={isLooping} onChange={setIsLooping}/>
                              <Tag color={'purple'} style={{fontSize:'1.2em'}}>{`LAST-Q=${nowQ.name}`}</Tag>

                          </Space>

                          <Space >
                                  {/*<Text style={{color: '#8c8c8c'}}><RetweetOutlined/> Loop</Text>*/}


                              {/*<Space>*/}
                              {/*    <Space.Compact>*/}
                              {/*        <Button disabled={true}>Cue</Button>*/}
                              {/*        <Button  icon={<PlusOutlined/>} onClick={() => setDataSource([...dataSource, defaultQ[0]])}>Add</Button>*/}
                              {/*    </Space.Compact>*/}
                              {/*</Space>*/}
                              {/*<Button danger icon={<DeleteOutlined/>}*/}
                              {/*        onClick={() => setDataSource(dataSource.shift())}*/}
                              {/*        disabled={isRunning}>Del Cue</Button>*/}
                              <Space>
                                  <Space.Compact>
                                      <Button disabled={true}>JSON</Button>
                                      <Button icon={<UploadOutlined/>} onClick={exportToJson}></Button>
                                      <Upload beforeUpload={handleImport} showUploadList={false}>
                                          <Button icon={<DownloadOutlined/>}></Button>
                                      </Upload>
                                  </Space.Compact>
                              </Space>
                              <Space>
                                  <Space>
                                      <Space.Compact block>
                                          <Button color="orange" variant="outlined">Q-Group</Button>
                                          <Button color="orange" variant="outlined" icon={<UsergroupDeleteOutlined />} onClick={() => setDataSource([...dataSource, defaultQ[0]])}>-</Button>
                                      </Space.Compact>
                                  </Space>

                              </Space>
                          </Space>
                      </div>}
            >


                <Table dataSource={dataSource} columns={columns} rowKey="id" pagination={false}/>
            </Card>

            {/*      <style>{`*/}
            {/*  .ant-table { background: #141414 !important; color: #fff !important; border-color: #333 !important; }*/}
            {/*  .ant-table-thead > tr > th { background: #1f1f1f !important; color: #8c8c8c !important; border-color: #333 !important; }*/}
            {/*  .ant-table-tbody > tr > td { border-color: #222 !important; }*/}
            {/*  .ant-input-number, .ant-input { background: transparent !important; color: white !important; border-color: #444 !important; }*/}
            {/*  .ant-progress-inner { background-color: #333 !important; }*/}
            {/*`}</style>*/}
        </>
    );
};

export default MiniQ;