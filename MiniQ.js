import React, {useState, useRef, useEffect} from 'react';
import * as cron from 'cron';


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
    message, Flex, Alert, Statistic, Row, Col, Popconfirm
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
    UploadOutlined,
    MinusCircleOutlined,
    DeleteRowOutlined,
    UsergroupDeleteOutlined,
    FieldTimeOutlined,
    ScheduleOutlined,
    LoginOutlined, ClockCircleOutlined, DashboardOutlined, MenuUnfoldOutlined, EditOutlined, SettingOutlined,
    EllipsisOutlined
} from '@ant-design/icons';
// import {useStoreX} from "../model/StoreX.jsx";
// import {ISOStringX, ISOStringX2} from "../model/xlinx.js";
const {TextArea} = Input;

const {Timer} = Statistic;

const {Text} = Typography;
const enum_DATEXFORMAT = Object.freeze({
    YYYMMDD: "YYMMDD",
    MMDD: "MMDD",
    YYYMMDD_hhmmssmillis: "YYY/MM/DD_hh:mm:ss:millis",
    YYYMMDD_hhmmss_noSlash: "YYYMMDD_hh:mm:ss",
    YYYMMDD_hhmmss: "YYY/MM/DD_hh:mm:ss",
});
function nowX(type) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    // Milliseconds can also be added if needed, padded to 3 digits
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    // 20251131.235959000
    switch (type) {
        case enum_DATEXFORMAT.MMDD:
            return `${month}${day}`;
        case enum_DATEXFORMAT.YYYMMDD:
            return `${year}${month}${day}`;
        case enum_DATEXFORMAT.YYYMMDD_hhmmss_noSlash:
            return `${year}${month}${day}_${hours}:${minutes}:${seconds}`;
        case enum_DATEXFORMAT.YYYMMDD_hhmmssmillis:
            return `${year}/${month}/${day}_${hours}:${minutes}:${seconds}.${milliseconds}`;
        case enum_DATEXFORMAT.YYYMMDD_hhmmss:
            return `${year}/${month}/${day}_${hours}:${minutes}:${seconds}`;
    }
}
Date.prototype.toISOString = function () {
    let pad = (n) => (n < 10) ? '0' + n : n;
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
function KeyListenCompoment() {
    const [eventKey, seteventKey] = useState(undefined);
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check for specific keys like 'Enter', 'Escape', or 'a'
            seteventKey(event.key)
            if (event.key === 'Escape') {
                console.log('Escape key pressed');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []); // Empty dependency array means this runs once

    return <Tag color={''} variant={'fi'} style={{color:'#a800ff',fontSize:'1em'}}>Global Hot Key: {eventKey}</Tag>;
}
const MiniQ = ({group, gIndex, useStoreX,allAction, RX_JSON, defaultQ,onChange}) => {
    const {setTX_JSON_CMD} = useStoreX();

    // 1. Initial State with LocalStorage Loading
    const [dataSource, setDataSource] = useState(group.gData);
    const [nowQ, setnowQ] = useState(dataSource[0]);
    const [isRunning, setIsRunning] = useState(false);

    // const [isLooping, setIsLooping] = useState(group.isLooping);
    // const [isCron, setisCron] = useState(group.isCron);
    // const [isTC, setisTC] = useState(group.isTC);

    const stopSignal = useRef(false);

    useEffect(() => {
        onChange(dataSource)

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
    function runNow(currentCue){
        updateCueState(currentCue.id, {status: 'complete', percent: 100});
        setTX_JSON_CMD(`${currentCue.name}` + Date.now())
        setnowQ(currentCue)
        console.log(currentCue.name)
    }
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
                    await new Promise(r => setTimeout(r, 100));
                }
                runNow(currentCue)


            }
            return true;
        };

        let finishedNaturally = await execute();
        while (group.isLooping && finishedNaturally && !stopSignal.current) {
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

    // const { styles } = useStyle();
    function formatMillis(millis) {
        let totalSeconds = Math.floor(millis / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;
        minutes = String(minutes).padStart(2, '0');
        seconds = String(seconds).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function subTC(t1s, t2s) {
        if (t1s === undefined || t2s === undefined)
            return Number.NaN
        const t1 = t1s.split(';')[0]
        const t2 = t2s.split(';')[0]
        const t1_arr = t1.split(':')
        const t2_arr = t2.split(':')
        const t1_arr_num = t1_arr.map(i => parseInt(i))
        const t2_arr_num = t2_arr.map(i => parseInt(i))
        const diff = t1_arr_num.map((i, idx) => i - t2_arr_num[idx])
        // console.log(diff)
        const r = ((diff[0] * 60 * 60) + (diff[1] * 60) + diff[2])
        return r//(r>0?'+':'')+r+'sec'
        // return diff.join(';')
    }

    const columns = [
        {
            fixed: 'start',
            title: 'Status',
            dataIndex: 'status',
            width: 90,
            render: (s) => (s === 'running' ? <Tag color="#52c41a">LIVE</Tag> : s === 'complete' ?
                <Tag color="#108ee9">DONE</Tag> : <Tag>IDLE</Tag>)
        },
        {
            sorter: true,
            title: 'No.',
            dataIndex: 'number',
            width: 100,
            render: (v, r) => <Input variant="borderless" value={v}
                                     onChange={e => updateCueState(r.id, {number: e.target.value})}
                                     style={{color: '#1890ff', fontWeight: 'bold'}}/>
        }, {
            sorter: true,
            title: 'HKey.',
            dataIndex: 'hotKey',
            width: 100,
            render: (v, r) => <Input variant="borderless" value={v} maxLength={1}
                                     onChange={e => updateCueState(r.id, {hotKey: e.target.value})}
                                     style={{color: '#a800ff', fontWeight: 'bold'}}/>
        },
        {
            fixed: 'start',
            width: 300,
            title: 'Command',
            dataIndex: 'name',
            render: (val, record) => (
                <TextArea variant='filled' defaultValue={val} style={{color: '#fef'}}

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
        ,{
            sorter: true,
            title: <>

                <LoginOutlined color={'green'}/> LTC Trigger

                {/*<Tag style={{fontSize:'0.8em'}} color={'gold'}>{RX_TC.TS_DELTA.toString()}ms</Tag>*/}
            </>,
            dataIndex: 'timecode',
            width: 150,
            render: (v, r) => {
                const tc_r = subTC(RX_JSON?.TC?.string || '0:0:0', v)

                return <>
                    <Input disabled={group.isTC} variant="outlined" value={v}
                           onChange={e => updateCueState(r.id, {timecode: e.target.value})}
                           style={{color: group.isTC ? '#1890ff' : '#999999', fontWeight: 'bold', textAlign: 'center'}}/>
                    <Tag variant={tc_r > -10 && tc_r <= 0 ? 'solid' : 'outlined'} color={'blue'}>
                        <FieldTimeOutlined/> Countdown= {tc_r > 0 ? '+' : ''}{tc_r}s </Tag>

                </>
            }
        }
        , {
            sorter: true,
            title: <><FieldTimeOutlined/> Clock(S:M:H:D:M:W)
                {/*<Tag variant={'solid'} color={'#000'}> NOW <DashboardOutlined/> {ISOStringX()} </Tag>*/}
            </>,
            dataIndex: 'cron',
            width: 110,
            render: (v, r) => {
                return <>
                    <Input disabled={group.isCron} variant="outlined" value={v}
                           onChange={e => updateCueState(r.id, {cron: e.target.value})}
                           style={{color: group.isCron ? '#1890ff' : '#999999', fontWeight: 'bold', textAlign: 'center'}}/>
                    <Tag variant={'solid'}
                         color={'black'}> NEXT <ScheduleOutlined/> {cron.validateCronExpression(v).valid ? cron.sendAt(v).toISO().split('.000')[0] : '??'}
                    </Tag>
                    <Tag variant={'solid'}
                         color={'black'}> Count-Down <FieldTimeOutlined/> {cron.validateCronExpression(v).valid ? formatMillis(cron.timeout(v)) : '??'}
                    </Tag>
                    {/*<Countdown targetDate={ cron.sendAt(v).toISO()}/>*/}
                </>
            }
        },
        {
            // title: <><ClockCircleOutlined/> Wait(ms)</>,
            title:'Wait(ms)',
            dataIndex: 'wait',

            render: (v, r) => <>
                <InputNumber style={{textAlign: 'center'}}
                             min={0} value={v} step={500} onChange={val => updateCueState(r.id, {wait: val})}/>
                <Tag variant={'solid'}
                     color={'black'}> {String.fromCodePoint(clockSeq[Math.round(r.percent / 100 * 12)])}️ {Math.round(r.percent / 100 * r.wait)}</Tag>
            </>
        },
        {
            fixed: 'end',
            title: 'Progress',
            dataIndex: 'percent',
            // width: 40,
            render: (percent, record) => (
                <Space vertical={true}>
                    <Progress
                        percent={percent}
                        percentPosition={{align: 'center', type: 'inner'}}
                        steps={5}
                        format={percent => `${percent.toString().padStart(3, '0')}%  `}
                        size={[10, 20]}
                        status={record.status === 'running' ? 'active' : 'normal'}
                        strokeColor={record.status === 'complete' ? '#52c41a' : '#c110e9'}
                        showInfo={false}
                    />
                    <Tag>{percent}%</Tag>
                </Space>
            )
        },
        {
            fixed: 'end',
            title: 'Actions', width: 150, render: (_, r, idx) => (
                <Space>
                    <Tooltip title="Insert Below">
                        <Button icon={<PlusCircleOutlined/>} size="small" onClick={() => {
                            const newData = [...dataSource];
                            let newCue = {...defaultQ[0]}
                            newCue.id = nowX(enum_DATEXFORMAT.YYYMMDD_hhmmssmillis)
                            newCue.number = group.gData.length
                            newCue.name = newCue.name + nowX(enum_DATEXFORMAT.YYYMMDD_hhmmss_noSlash) + '/'
                            newData.splice(idx + 1, 0, newCue);
                            setDataSource(newData);
                        }}/></Tooltip>
                    <Button icon={<ArrowUpOutlined/>} size="small" disabled={idx === 0 || isRunning}
                            onClick={() => moveCue(idx, 'up')}/>
                    <Button icon={<ArrowDownOutlined/>} size="small"
                            disabled={idx === dataSource.length - 1 || isRunning} onClick={() => moveCue(idx, 'down')}/>
                    <Button danger icon={<DeleteOutlined/>} size="small"
                            onClick={() => setDataSource(prev => prev.filter(i => i.id !== r.id))}
                            disabled={isRunning || dataSource.length === 1}/>
                </Space>
            )
        }
    ];

    function stopSequence() {
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
    useEffect(() => {

        const nowMillis = Math.round(Date.now() / 1000)
        dataSource.forEach((e, index) => {
            if (group.isTC) {
                const tc_r = subTC(RX_JSON?.TC?.string, e.timecode)
                if (tc_r === 0) {
                    e.status = 'running';
                    console.log(new Date().toISOString(), '[OOO][TCCheck]', e.name, e.id, dataSource)
                    setTX_JSON_CMD(`${e.name}` + nowMillis)
                } else {
                    e.status = 'idle';
                }
            }
            if (group.isCron && cron.validateCronExpression(e.cron).valid) {
                const cronNow = Math.round(cron.sendAt(e.cron).valueOf() / 1000)
                // console.log('[?][cronCheck]',cronNow, nowMillis)
                if (cronNow === nowMillis) {
                    e.status = 'running';
                    console.log(new Date().toISOString(), '[OOO][cronCheck]', cronNow, nowMillis, e.name, e.id, dataSource)

                    setTX_JSON_CMD(`${e.name}` + nowMillis)
                } else {
                    e.status = 'idle';
                }
            }
        })
        // }, 1000);
    }, [Math.round(Date.now() / 1000)]);
    return (
        <>
            <Card style={{background: '#141414', borderColor: 'rgb(95 56 2)', marginBottom: 20}}
                  actions={[
                      // <span style={{fontSize:'1.3em'}}>
                      //     <div style={{
                      //         height: '14px',
                      //         width: '5px',
                      //         backgroundColor: (RX_TC.TS_DELTA < 1000 && RX_TC.TS_DELTA > -1000) ? (RX_TC.TS_DELTA % 2 === 0 ? '#2ecc71' : '#26b262') : '#fe0c71',
                      //         borderRadius: '0%', display: 'inline-block'
                      //     }}/>
                      //     <Tag icon={<LoginOutlined/>} color={'blue'} style={{fontSize: '1em'}}>
                      //       Time-Code(LTC)
                      //     <Tag color={'blue'} style={{fontSize: '1em'}}>
                      //       {RX_JSON?.TC?.string || 'hh:mm:ss:f'}
                      //         <Tag style={{fontSize: '0.8em'}} color={'blue'}>{RX_TC.framerate || '?'}fps</Tag>
                      //       </Tag>
                      //       </Tag>
                      // </span>,
                      <KeyListenCompoment/>,
                      <span style={{fontSize:'1.3em'}} > NOW <DashboardOutlined/> {ISOStringX2()} </span>,
                      <Space>
                          {/*<SettingOutlined key="setting"/>*/}
                          <Switch
                              checkedChildren="Clock"
                              unCheckedChildren="Clock"
                              disabled={true}
                              checked={group.isCron} />
                          <Switch
                              checkedChildren="TC/LTC"
                              unCheckedChildren="TC/LTC"
                              disabled={true}

                              checked={group.isTC} />
                          <Switch
                              checkedChildren="LOOP"
                              unCheckedChildren="LOOP"
                              disabled={true}

                              checked={group.isLooping} />

                      </Space>
                  ]}
                  title={
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <Space size="middle">
                              <Col>
                                  {/*<Row style={{ marginBottom: 10}}>*/}
                                  {/*    <Switch size="small"*/}
                                  {/*            checkedChildren="Clock"*/}
                                  {/*            unCheckedChildren="Clock"*/}
                                  {/*            checked={isCron} onChange={setisCron}/>*/}
                                  {/*    <Switch size="small"*/}
                                  {/*            checkedChildren="TC/LTC"*/}
                                  {/*            unCheckedChildren="TC/LTC"*/}
                                  {/*            checked={isTC} onChange={setisTC}/>*/}
                                  {/*    <Switch size="small"*/}
                                  {/*            checkedChildren="LOOP"*/}
                                  {/*            unCheckedChildren="LOOP"*/}
                                  {/*            checked={isLooping} onChange={setIsLooping}/>*/}
                                  {/*</Row>*/}
                                  <Row>
                                      <Space.Compact>
                                          <Button color="purple" variant="solid" size="default"
                                                  icon={<StepForwardOutlined/>}
                                                  onClick={() => {
                                                      runSequence()
                                                  }}
                                                  loading={isRunning}
                                                  style={{
                                                      // background: '#52c41a',
                                                      // borderColor: '#52c41a',
                                                      width: 130
                                                  }}>GO</Button>
                                          <Button danger size="default" icon={<StopOutlined/>} onClick={() => {
                                              stopSequence()
                                          }} disabled={!isRunning}>STOP</Button>

                                      </Space.Compact>
                                  </Row>

                              </Col>

                              <Tag color={'purple'} style={{fontSize: '1.8em'}}><MenuUnfoldOutlined/> {`${nowQ.name}`}
                              </Tag>

                          </Space>


                      </div>}
            >


                <Table dataSource={dataSource} scroll={{ x: 'max-content' }} columns={columns} rowKey="id" pagination={false}/>
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