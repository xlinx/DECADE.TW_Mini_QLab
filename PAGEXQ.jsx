import React, {useEffect, useState} from "react";
import {Button, Card, Collapse, Divider, Input, message, Row, Space, Splitter, Tag, Upload} from "antd";
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    CaretRightOutlined, DeleteOutlined,
    DownloadOutlined,
    FileExcelOutlined, GroupOutlined, PlayCircleOutlined,
    SaveOutlined,
    StopOutlined, UploadOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined, UserOutlined
} from "@ant-design/icons";
const { Search } = Input;
const {TextArea} = Input;
import MiniQ from "./MiniQ.jsx";
// import {useStoreX} from "../model/StoreX.jsx";
import {create} from "zustand";
import {immer} from "zustand/middleware/immer";
export const useStoreX = create(immer((set) => ({
    RX_JSON: {}
})));

export function ISOStringX(){
    const date=new Date()
    let pad =(n)=>(n < 10)?'0' + n:n;
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
const defaultGobj={gName:'g'+ISOStringX(),gData:defaultQ}
const defaultG = [defaultGobj]
function getNewGroupObj() {
    return {...defaultGobj,gName:'g_'+ISOStringX()}
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

const StaticHTML = () => {
    checkStorage()
    const {RX_JSON} = useStoreX();
    // const SAVED_LEN = JSON.parse(localStorage.getItem('qlab_cues'));
    // const [groupCount, setgroupCount] = useState(SAVED_LEN ? Object.keys(SAVED_LEN).length : 1);
    const [dataSource, setDataSource] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('qlab_cues'))||defaultG;
        return saved ? saved : {}
    });
    const [allAction, setallAction] = useState('');

    const moveGroup = (index, direction) => { //[{},{},{}]
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
    useEffect(() => {
        localStorage.setItem('qlab_cues', JSON.stringify(dataSource))

    },[dataSource])
    return (
        <>
            <Card style={{margin: "10px", padding: "0px"}}
                  extra={
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
                                      <Button disabled={true}>JSON</Button>
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
                                              onClick={() => setDataSource([...dataSource,{...defaultGobj,gName:'g_'+ISOStringX()}])}>+</Button>
                                      <Button color="orange" variant="outlined" iconx={<UsergroupDeleteOutlined/>}
                                              disabled={dataSource.length <= 1}
                                              onClick={() => {
                                                  let newData=[...dataSource]
                                                  console.log('delete',newData)
                                                  newData=newData.slice(0,-1)
                                                  setDataSource(newData)
                                              }}>-</Button>
                                  </Space.Compact>
                              </Space>
                          </Space>
                      </Tag>
                  }
                  title={<Space>
                      <Tag style={{fontSize: '20px'}} variant={'solid'} color={"purple"}>🇶 DLab - SuperQ</Tag>

                  </Space>
                  }
            >
                <Space>
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
                </Space>

                <Collapse

                    style={{marginTop: '30px', background: '#101'}}
                    bordered={true}
                    defaultActiveKey={[]}
                    expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 0}/>}
                    // style={{ background: token.colorBgContainer }}
                    items={dataSource.map((e, i) => {
                        const child = (<div key={`decade_d1_${i}`}>
                                <MiniQ group={e} gIndex={i} useStoreX={useStoreX} allAction={allAction} RX_JSON={RX_JSON} defaultQ={defaultQ} onChange={(e) => {
                                    console.log('change', e)
                                    let newDataSource = [...dataSource]
                                    newDataSource[i].gData=e
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
                                        <Space.Addon><GroupOutlined /> GroupName </Space.Addon>
                                        <Input
                                            value={dataSource[i].gName}
                                            // defaultValue={Object.keys(dataSource)[i]}
                                            variant={'underlined'}
                                            color={'purple'}
                                            width={'120px'}
                                            styles={{width:'120',background: 'transparent', border: 'none', color: '#fff'}}
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
                                                    newDataSource[i].gName=e.target.value
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
                                <Space.Compact>
                                    <Button disabled={true}>Ex/Import </Button>
                                    <Button icon={<UploadOutlined/>} onClick={exportToJson}></Button>
                                    <Upload beforeUpload={handleImport} showUploadList={false}>
                                        <Button icon={<DownloadOutlined/>}></Button>
                                    </Upload>

                                    <Button disabled={true}>Move</Button>
                                    <Button disabled={i === 0} icon={<ArrowUpOutlined/>}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveGroup(i, 'up')
                                            }}/>
                                    <Button disabled={i === dataSource.length - 1} icon={<ArrowDownOutlined/>}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveGroup(i, 'down')
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

                {/*<Divider variant="dashed" style={{ borderColor: 'purple' }} dashed>*/}
                {/*    Group1*/}
                {/*</Divider>*/}
                {/*<MiniQ group={1}/>*/}
                {/*<Divider variant="dashed" style={{ borderColor: 'purple' }} dashed>*/}
                {/*    Group2*/}
                {/*</Divider>*/}
                {/*<MiniQ group={2}/>*/}


            </Card>
            <Divider>DECADE.TW-debugMode=ON</Divider>
            <Card>
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
                {/*<Collapse*/}
                {/*    style={{marginTop: '30px', background: '#101'}}*/}
                {/*    bordered={true}*/}
                {/*    defaultActiveKey={[]}*/}
                {/*    expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 0}/>}*/}
                {/*    // style={{ background: token.colorBgContainer }}*/}
                {/*    items={[*/}
                {/*        <>*/}
                {/*            <Splitter>*/}
                {/*                <Splitter.Panel defaultSize="50%" min="20%" max="70%">*/}
                {/*                    <TextArea style={{padding: '10px', fontSize: '1em'}} rows={20}*/}
                {/*                              placeholder={dataSource ? JSON.stringify(dataSource, null, 2) : 'No Data'}/>*/}
                {/*                </Splitter.Panel>*/}
                {/*                <Splitter.Panel>*/}
                {/*                    <TextArea style={{padding: '10px', fontSize: '1em'}} rows={20}*/}
                {/*                              placeholder={JSON.stringify(RX_JSON, null, 2)}/>*/}
                {/*                </Splitter.Panel>*/}
                {/*            </Splitter>*/}
                {/*        </>*/}
                {/*    ]}*/}
                {/*>*/}
                {/*</Collapse>*/}

            </Card>
        </>
    )
}
export default StaticHTML;
