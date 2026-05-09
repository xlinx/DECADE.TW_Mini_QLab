# DECADE.TW-Mini-QLab
QLab is the industry-standard software for multimedia show control (audio, video, lighting) on macOS, now its avaiable on nodejs, this lib only imprelement Network cue and timecode decoder from audio device.

<hr/>

## 💡Update Log
* [added] | 🟢 standalone Mini-QLab App by Electron
  * mac(arm64|M1-M5/intel)  
    * [mini-qlab-1.0.0-arm64.dmg](https://github.com/xlinx/DECADE.TW_Mini_QLab/app-bin) 
    * [mini-qlab-1.0.0-intel64.dmg](https://github.com/xlinx/DECADE.TW_Mini_QLab/app-bin)
  * win(arm64/intel64)  
    * [mini-qlab.arm64.exe](https://github.com/xlinx/DECADE.TW_Mini_QLab/app-bin) 
    * [mini-qlab.intel64.exe](https://github.com/xlinx/DECADE.TW_Mini_QLab/app-bin)
  * linux(snap/AppImage)  
    * [mini-qlab.snap](https://github.com/xlinx/DECADE.TW_Mini_QLab/app-bin)
    * [mini-qlab.AppImage](https://github.com/xlinx/DECADE.TW_Mini_QLab/app-bin)
* [adding] | 🟠 Hotkey by USB-HID (No need to focus on window)
* [adding] | 🟠 Hotkey (need focus on window)
* [adding] | 🟠 [TX] TimeCode (LTC)
* [added ] | 🟢 ActiveCue side window
* [added ] | 🟢 Cue trigger control - by cron job
* [added ] | 🟢 Cue trigger control - by world clock
* [added ] | 🟢 Cue trigger control - by loop
* [added ] | 🟢 Cue trigger - by group
* [added ] | 🟢 [RX] TimeCode (LTC) support on MAC (WIN not test should be ok)

<hr/>

## 💡Screenshot
### [Main] Mini-Q standalone App (mac/win/linux) 
![image](imges/mini-q-electron.png)   
### [Main] Cue List - HotKey/Cron/LTC/Loop
![image](imges/All.png)
### [add]Active Cue - side window 
![image](imges/ActiveCue.png)
### [add]HotKey
![image](imges/HotKey.png)
### [add] LTC - Select Audio Device
![image](imges/SelectAD.png)

### Video Demo Youtube link - Click 
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
<hr/>

### Quick Links

* Auto prompt by LLM and LLM-Vision (Trigger more details out inside model)
    * SD-WEB-UI: https://github.com/xlinx/sd-webui-decadetw-auto-prompt-llm
    * ComfyUI:   https://github.com/xlinx/ComfyUI-decadetw-auto-prompt-llm
* Auto msg to ur mobile  (LINE | Telegram | Discord)
    * SD-WEB-UI :https://github.com/xlinx/sd-webui-decadetw-auto-messaging-realtime
    * ComfyUI:  https://github.com/xlinx/ComfyUI-decadetw-auto-messaging-realtime
* I'm SD-VJ. (share SD-generating-process in realtime by gpu)
    * SD-WEB-UI: https://github.com/xlinx/sd-webui-decadetw-spout-syphon-im-vj
    * ComfyUI:   https://github.com/xlinx/ComfyUI-decadetw-spout-syphon-im-vj
* CivitAI Info|discuss:
    * https://civitai.com/articles/6988/extornode-using-llm-trigger-more-detail-that-u-never-thought
    * https://civitai.com/articles/6989/extornode-sd-image-auto-msg-to-u-mobile-realtime
    * https://civitai.com/articles/7090/share-sd-img-to-3rd-software-gpu-share-memory-realtime-spout-or-syphon
* DECADE.TW
    * https://decade.tw