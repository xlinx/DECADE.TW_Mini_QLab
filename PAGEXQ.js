import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    Col,
    Collapse,
    Divider,
    Input,
    Layout,
    message,
    Row,
    Space,
    Splitter, Switch,
    Table,
    Tag,
    Upload
} from "antd";
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    CaretRightOutlined,
    DeleteOutlined,
    DownloadOutlined,
    FileExcelOutlined,
    GroupOutlined, LoginOutlined,
    PlayCircleOutlined,
    SaveOutlined,
    StopOutlined, SyncOutlined,
    UploadOutlined,
    UsergroupAddOutlined,
    UsergroupDeleteOutlined,
    UserOutlined
} from "@ant-design/icons";
import MiniQ from "./MiniQ.jsx";
// import {useStoreX} from "../model/StoreX.jsx";

const { Header, Footer, Sider, Content } = Layout;

const {Search} = Input;
const {TextArea} = Input;
export const useStoreX = create(immer((set) => ({
    RX_JSON: {}
})));
const enum_DATEXFORMAT = Object.freeze({
    YYYMMDD: "YYMMDD",
    MMDD: "MMDD",
    YYYMMDD_hhmmssmillis: "YYY/MM/DD_hh:mm:ss:millis",
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
        case enum_DATEXFORMAT.YYYMMDD_hhmmssmillis:
            return `${year}/${month}/${day}_${hours}:${minutes}:${seconds}.${milliseconds}`;
        case enum_DATEXFORMAT.YYYMMDD_hhmmss:
            return `${year}/${month}/${day}_${hours}:${minutes}:${seconds}`;
    }
}
export function ISOStringX() {
    const date = new Date()
    let pad = (n) => (n < 10) ? '0' + n : n;
    let hours_offset = date.getTimezoneOffset() / 60;
    let offset_date = date.setHours(date.getHours() - hours_offset);
    let symbol = (hours_offset >= 0) ? "-" : "+";
    // let time_zone = symbol+pad(Math.abs(hours_offset))+ ":00";

    return date.getUTCFullYear() +
        // '-' +
        pad(date.getUTCMonth() + 1) +
        // '-' +
        pad(date.getUTCDate()) +
        '_' +
        pad(date.getUTCHours()) +
        // ':' +
        pad(date.getUTCMinutes()) +
        // ':' +
        pad(date.getUTCSeconds())
    // +'.' +
    // (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5);
    // + time_zone;

}

const defaultQ = [
    {
        id: ISOStringX(),
        number: '-1',
        name: '/cue/god/',
        wait: 1000,
        timecode: "1:0:5:00",
        cron: '*/2 * * * * *',
        status: 'idle',
        percent: 0
    }
]
const defaultGobj = {
    gName: 'g' + ISOStringX(), gData: defaultQ,
    isLooping:true,
    isCron:false,
    isTC:false,
}
const defaultG = [defaultGobj]

function getNewGroupObj() {
    return {...defaultGobj, gName: 'g_' + ISOStringX()}
}

function checkStorage() {
    try {
        let str = localStorage.getItem('qlab_cues')
        if (str === null) {
            localStorage.setItem('qlab_cues'.JSON.stringify(defaultG))
        }
        const J = JSON.parse(localStorage.getItem('qlab_cues'));
        // console.log('checkStorage',J)
        if (J === null) {
            localStorage.removeItem('qlab_cues')
        }
    } catch (e) {
        localStorage.removeItem('qlab_cues')
    }

}
function LayoutHeader({setallAction,setSizes }) {
    const [enabled, setEnabled] = React.useState(false);

    return (
        <Row justify="space-between">
            <Col>
                <Space.Compact block>
                    <Button typex="primary"
                            color="purple" variant="solid"
                            style={{height: '60px', fontSize: '1.3em'}}
                            icon={<PlayCircleOutlined/>} onClick={() => {
                        setallAction('GO')
                    }} disabled={false}>GO-ALL</Button>
                    <Button
                        style={{height: '60px', fontSize: '1.3em'}}
                        color={'red'}
                        variant={'dashed'} icon={<StopOutlined/>}
                        onClick={() => {
                            setallAction('STOP')
                        }} disabled={false}>STOP-ALL</Button>
                </Space.Compact>
            </Col>
            <Col  align="flex-end" justify="space-around" style={{padding: 0}}>
                <Switch
                    value={enabled}
                    onChange={() => {
                        setEnabled(!enabled)
                        enabled?setSizes([100,0]):setSizes([80,20])
                    }}
                    checkedChildren="Active-Cue-Panel-ON"
                    unCheckedChildren="Active-Cue-Panel-OFF"
                />
                {/*<Button type="text" icon={<SyncOutlined spin />} style={{fontSize: '1em',color:'purple'}} onClick={()=>{*/}
                {/*    setSizes(['80%', '20%'])*/}
                {/*}}>Active-Cue-Panel</Button>*/}
            </Col>
        </Row>
    )

}
const moveGroup = (index, direction,dataSource,setDataSource) => { //[{},{},{}]
    const newData = [...dataSource];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newData.length) {
        [newData[index], newData[targetIndex]] = [newData[targetIndex], newData[index]];
        setDataSource(newData);
    }
};
const exportToJson = () => {
    const cleanData = JSON.parse(localStorage.getItem('qlab_cues') || defaultG)
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Q.DECADE.TW_${ISOStringX()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    message.success("Cue list exported successfully");
};
const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importJSON = JSON.parse(e.target.result)
            localStorage.setItem('qlab_cues', JSON.stringify(importJSON))
        } catch (err) {
            message.error("Invalid JSON file", err);
        }
    };
    reader.readAsText(file);
    return false; // Prevent auto-upload
};
function LayoutFotterX({dataSource}) {
    const {RX_JSON} = useStoreX();
    return(
        <>
            <Divider>DECADE.TW-debugMode=ON</Divider>
            <Card style={{margin: "10px", padding: "0px"}}>
                <Row>
                    <Button onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(dataSource)).then(function () {
                            /* Success message (optional) */
                            // alert("Copied the text: " + RX_STR);
                        }).catch(function (error) {
                            /* Error handling (optional) */
                            console.error('Failed to copy text: ', error);
                        });
                    }}>Copy as JSON - DLab</Button>
                    <Button onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(RX_JSON)).then(function () {
                            /* Success message (optional) */
                            // alert("Copied the text: " + RX_STR);
                        }).catch(function (error) {
                            /* Error handling (optional) */
                            console.error('Failed to copy text: ', error);
                        });
                    }}>Copy as JSON - Server Info</Button>
                </Row>
            </Card>
        </>
    )
}
function LayoutContentX({dataSource,setDataSource,allAction}) {
    const {RX_JSON} = useStoreX();

    return (
        <Collapse
            style={{marginTop: '30px', background: '#101'}}
            bordered={true}
            defaultActiveKey={[]}
            expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 0}/>}
            // style={{ background: token.colorBgContainer }}
            items={dataSource.map((e, i) => {
                const child = (<div key={`decade_d1_${i}`}>
                        <MiniQ group={e} gIndex={i} useStoreX={useStoreX} allAction={allAction}
                               RX_JSON={RX_JSON} defaultQ={defaultQ} onChange={(e) => {
                            // console.log('change', e)
                            let newDataSource = [...dataSource]
                            newDataSource[i].gData = e
                            setDataSource(newDataSource)
                        }}/>
                    </div>
                )
                return {
                    key: i,
                    label: <Tag key={`decade_t1_${i}`} color={'purple'}
                                style={{fontSize: '1.3em'}}>

                        <Space>
                            <Space.Compact>
                                <Space.Addon><GroupOutlined/> GroupName </Space.Addon>
                                <Input
                                    value={dataSource[i].gName}
                                    // defaultValue={Object.keys(dataSource)[i]}
                                    variant={'underlined'}
                                    color={'purple'}
                                    width={'120px'}
                                    styles={{
                                        width: '120',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    onChange={
                                        (e) => {
                                            e.stopPropagation();
                                            console.log('change', e)
                                            let newDataSource = [...dataSource]
                                            // const oldKey=e.target.defaultValue
                                            // const newKey=e.target.value
                                            newDataSource[i].gName = e.target.value
                                            // delete newDataSource[oldKey]
                                            setDataSource(newDataSource)
                                            // if (!e.target.value.endsWith("/")) {
                                            //
                                            // }
                                        }
                                    }
                                />
                            </Space.Compact>
                        </Space>

                    </Tag>,
                    children: child,
                    extra: <Space>
                        <Space onClick={(e) => {
                            e.stopPropagation();
                        }}>
                            {/*<SettingOutlined key="setting"/>*/}
                            <Switch
                                checkedChildren="Clock"
                                unCheckedChildren="Clock"
                                checked={dataSource[i].isCron}
                                onChange={(e) => {
                                    let newD=[...dataSource]
                                    newD[i].isCron=e
                                    setDataSource(newD)
                                }}
                            />
                            <Switch
                                checkedChildren="TC/LTC"
                                unCheckedChildren="TC/LTC"
                                checked={dataSource[i].isTC}
                                onChange={(e) => {
                                    let newD=[...dataSource]
                                    newD[i].isTC=e
                                    setDataSource(newD)
                                }}
                            />
                            <Switch
                                checkedChildren="LOOP"
                                unCheckedChildren="LOOP"
                                checked={dataSource[i].isLooping}
                                onChange={(e) => {
                                    let newD=[...dataSource]
                                    newD[i].isLooping=e
                                    setDataSource(newD)
                                }}
                            />

                        </Space>
                        <Space.Compact>
                            {/*<Button disabled={true}>Ex/Import </Button>*/}
                            {/*<Button icon={<UploadOutlined/>} onClick={exportToJson}></Button>*/}
                            {/*<Upload beforeUpload={handleImport} showUploadList={false}>*/}
                            {/*    <Button icon={<DownloadOutlined/>}></Button>*/}
                            {/*</Upload>*/}

                            <Button disabled={true}>Move</Button>
                            <Button disabled={i === 0} icon={<ArrowUpOutlined/>}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        moveGroup(i, 'up',dataSource,setDataSource)
                                    }}/>
                            <Button disabled={i === dataSource.length - 1} icon={<ArrowDownOutlined/>}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        moveGroup(i, 'down',dataSource,setDataSource)
                                    }}/>
                            <Button disabled={true}>Remove</Button>
                            <Button danger icon={<DeleteOutlined/>}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('delete group', e)
                                        const filteredFruits = dataSource.filter((_, index) => index !== i);
                                        setDataSource(filteredFruits);
                                        // let obj=JSON.parse(localStorage.getItem('qlab_cues'))
                                        // if(delete obj['g'+group])
                                        //     localStorage.setItem('qlab_cues',JSON.stringify(obj))
                                    }}
                            />
                        </Space.Compact>

                    </Space>
                    // style: panelStyle,
                }

            })}
        />
    )
}
function LayoutExtraX({dataSource,setDataSource}){
    return (
        <Tag color={'purple'} style={{fontSize: '1em'}}>
            <Space>
                {/*<span>CueTotal: {localStorage.getItem('DECADE_SuperQ')?.length||'?'}</span>*/}
                <Space>
                    <Space.Compact>
                        <Button disabled={true} icon={<SaveOutlined/>}>AutoSave:ON</Button>
                        <Button icon={<FileExcelOutlined/>} onClick={() => {
                            localStorage.removeItem('qlab_cues')
                        }}>Reset</Button>
                    </Space.Compact>
                </Space>
                <Space>
                    <Space.Compact>
                        <Button disabled={true}>JSON Ex/Import</Button>
                        <Button icon={<UploadOutlined/>} onClick={exportToJson}></Button>
                        <Upload beforeUpload={handleImport} showUploadList={false}>
                            <Button icon={<DownloadOutlined/>}></Button>
                        </Upload>
                    </Space.Compact>
                </Space>
                <Space>
                    <Space.Compact block>
                        <Button color="orange" variant="outlined">Q-Group={dataSource.length}</Button>
                        <Button color="orange" variant="outlined" iconx={<UsergroupAddOutlined/>}
                                onClick={() => setDataSource([...dataSource, {
                                    ...defaultGobj,
                                    gName: 'g_' + ISOStringX()
                                }])}>+</Button>
                        <Button color="orange" variant="outlined" iconx={<UsergroupDeleteOutlined/>}
                                disabled={dataSource.length <= 1}
                                onClick={() => {
                                    let newData = [...dataSource]
                                    console.log('delete', newData)
                                    newData = newData.slice(0, -1)
                                    setDataSource(newData)
                                }}>-</Button>
                    </Space.Compact>
                </Space>
            </Space>

        </Tag>
    )
}
function LayoutActiveCuesTableX({dataSourceX}){
    // console.log('LayoutActiveCuesTableX',dataSourceX)
    let cues=[]
    let count=0
    dataSourceX.map((e,i)=>{
        e.gData.map((e2,i2)=> {
            cues.push({
                key: count++,
                status: e2.status,
                name: e2.name,
                wait: e2.wait,
            })
        })
    })
    return(
        <>
            <Table dataSource={cues} columns={[
                {
                    title: 'Status',
                    dataIndex: 'status',
                    width: 90,
                    render: (s) => (s === 'running' ? <Tag color="#52c41a">LIVE</Tag> : s === 'complete' ?
                        <Tag color="#108ee9">DONE</Tag> : <Tag>IDLE</Tag>)

                },
                {
                    title: 'name',
                    dataIndex: 'name',
                    key: 'name',

                }
            ]} rowKey="key" pagination={false}></Table>
        </>
    )
}
function TimeCodeTag({RX_JSON}){
    const [showInfo, setShowInfo] = React.useState(false);
    // console.log('TimeCodeTag',RX_JSON.TC)
    let TS_DELTA=-1;
    if (RX_JSON.TC !== undefined) {
        TS_DELTA = RX_JSON.TC.TS - new Date().getTime()
    }

    return(
        <>
            <Tag color={'blue'} variant={'outlined'} style={{fontSize: '1em',}} onClick={()=>{setShowInfo(!showInfo)}}>
                <LoginOutlined/>
                Time-Code(LTC)
                <Tag color={'blue'} variant={'filled'} style={{fontSize: '1em'}}>
                    {RX_JSON?.TC?.string || 'hh:mm:ss:f'}
                </Tag>
                <div style={{width: '100px', display: 'inline', justifyContent: 'flex-end', alignItems: 'end'}}>
                    <div style={{
                        height: '14px',
                        width: '5px',
                        backgroundColor: (TS_DELTA < 1000 && TS_DELTA > -1000) ? (RX_JSON.TC?.polarity_correction ? '#2ecc71' : '#004425') : '#fe0c71',
                        borderRadius: '0%', display: 'inline-block'
                    }}/>
                    {showInfo ? <>
                        {RX_JSON.TC?.framerate || '?'}Hz
                        {RX_JSON.TC?.frames.toString().padStart(2, '0') || '?'}fps
                        {RX_JSON.TC?.dropframe ? 'Y' : 'N'}drop
                    </> : ''}

                </div>
            </Tag>
        </>
    )
}
const StaticHTML = () => {
    checkStorage()
    const [sizes, setSizes] = React.useState([100,0]);

    const {RX_JSON} = useStoreX();
    // const [RX_TC, setRX_TC] = useState({TS: 0, TS_DELTA: -9999, framerate: 0, string: '0:0:0:00'});
    // const [sliderCollapsed,setsliderCollapsed]=useState(false)
    // const SAVED_LEN = JSON.parse(localStorage.getItem('qlab_cues'));
    // const [groupCount, setgroupCount] = useState(SAVED_LEN ? Object.keys(SAVED_LEN).length : 1);
    const [dataSource, setDataSource] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('qlab_cues')) || defaultG;
        return saved ? saved : {}
    });
    const [allAction, setallAction] = useState('');

    useEffect(() => {
        localStorage.setItem('qlab_cues', JSON.stringify(dataSource))

    }, [dataSource])
    const bColor='#212'
    return (
        <>
            <Card style={{margin: "10px", padding: "0px"}}
                  extra={<LayoutExtraX dataSource={dataSource} setDataSource={setDataSource}/>}
                  title={<>
                      <Tag style={{fontSize: '1.2em'}} variant={'solid'} color={"purple"}>DLab - SuperQ</Tag>

                      {/*<Tag icon={<LoginOutlined/>} color={'black'} style={{fontSize: '1em'}}>*/}
                      {/*    NOW*/}
                      {/*    <Tag color={'blue'} style={{fontSize: '1em'}}>*/}
                      {/*        {nowX(enum_DATEXFORMAT.YYYMMDD_hhmmssmillis)}*/}

                      {/*    </Tag>*/}
                      {/*</Tag>*/}
                      <TimeCodeTag RX_JSON={RX_JSON} />
                  </>
                  }
            >
                <>
                    <LayoutHeader setallAction={setallAction} setSizes={setSizes}/>
                    <Splitter onResize={(e)=>{setSizes(e)}} style={{margin:'0px',boxShadow: '0 0 10px rgba(110, 0, 0, 0.1)'}} >
                        <Splitter.Panel style={{margin:'10px'}} collapsible resizable={true} min="50%" defaultSize={sizes[0]} size={sizes[0]}>
                            <LayoutContentX dataSource={dataSource} setDataSource={setDataSource} allAction={allAction}/>
                        </Splitter.Panel>
                        <Splitter.Panel style={{margin:'10px'}} collapsible resizable={true} defaultSize={sizes[1]} size={sizes[1]}>
                            <LayoutActiveCuesTableX dataSourceX={dataSource}/>
                        </Splitter.Panel>
                    </Splitter>
                </>
            </Card>
            <LayoutFotterX dataSource={dataSource}/>
        </>
    );
}
export default StaticHTML;
