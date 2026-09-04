# DECADE.TW-Mini-QLab
QLab is the industry-standard software for multimedia show control (audio, video, lighting) on macOS, now its avaiable on nodejs, this lib only imprelement Network cue and timecode decoder from audio device.
Mini QLab is a responsive React cue-list controller for show-control workflows.
It runs cue groups manually, sequentially, from cron schedules, browser
hotkeys, or externally supplied timecode. Output is delivered through an event
callback so the host application can connect its own OSC, MIDI, WebSocket, or
device transport.

- try online: https://www.decade.tw/qlab
- with websocket support 
  - default ws send to 127.0.0.1 port 8080
- udp/osc u need implement by npm on ur code
<hr/>

## 💡Update Log
* [added] | 🟢 add websocket support
* [modify] | remove antd lib
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
![websocket.png](imges/websocket.png)
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

### TimeCode input init Audio Device
```javascript

initAudioDevice({deviceName: 'aggX1',onFrame:onFrame});

```
 
<hr/>

## Library usage

```jsx
import MiniQLab from 'mini-qlab';
import 'mini-qlab/styles.css';

export function ShowControl() {
  return (
    <MiniQLab
      rxJson={{ TC: { string: '01:00:00:00' } }}
      onEvent={(event) => {
        if (event.type === 'cue:dispatched') {
          console.log(event.source, event.command);
        }
      }}
    />
  );
}
```

`onEvent` receives sequence lifecycle events and cue dispatches. Dispatch
sources are `sequence`, `cron`, `timecode`, and `hotkey`. `rxJson` is optional;
provide `RX_JSON.TC.string` in that shape to use TC/LTC triggers.

See the bilingual [Mini QLab manual](./mini-qlab.manual.md) for complete
controls, configuration, and limitations.



## Development

Run the automated tests and library build with:

```bash
npm test
npm run build
```


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