# DECADE.TW_Mini_QLab
QLab is the industry-standard software for multimedia show control (audio, video, lighting) on macOS, now its avaiable on nodejs, this lib only imprelement Network cue and timecode decoder from audio device.

### Screenshot
![image](DECADE.TW-MINI-Qlab.png)
### Video Demo - Youtube link
[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/PE2jOI2uq9E/0.jpg)](https://www.youtube.com/watch?v=PE2jOI2uq9E)

```bash
npm install antd react react-dom 
npm install decade.tw-mini-qlab
```

### TimeCode input init Audio Device
```javascript

initAudioDevice({deviceName: 'aggX1',onFrame:onFrame});

```
```javascript
//use PAGEXQ.jsx to imprelement MiniQ.jsx for Group Cue.

import MiniQ from "./MiniQ.jsx";

const [groupCount, setgroupCount] = useState(2);
const [allAction, setallAction] = useState(''); //send GO|STOP can control all Cue group
return(
    <>
        <Space>
            <Space.Compact block>
                <Button onClick={() => {setallAction('GO')}}>GO-ALL</Button>
                <Button onClick={() => {setallAction('STOP')}}>STOP-ALL</Button>
            </Space.Compact>
        </Space>
        {Array(groupCount).fill(0).map((e, i) => {
            return (<>
                    <Divider>Q-Group{i + 1}</Divider>
                    <MiniQ key={`MiniQ${i}`} group={'g'+i} allAction={allAction}/>
                </>
            )

        })}        
    </>    
    )

```

