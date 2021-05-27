import { Webview } from "https://deno.land/x/webview@0.5.6/mod.ts";
import { join, dirname, fromFileUrl } from "https://deno.land/std@0.95.0/path/mod.ts";
import Douyin, { ShareItem, VideoInfo, ItemInfo, Counter } from "./douyin.ts";

let ScriptDir = dirname(fromFileUrl(Deno.mainModule))

let html = `
  <html>
  <body style="position:absolute; top:-12px;">
    <button onclick="external.invoke('End')">End</button>
    <button onclick="external.invoke('test')">test</button>
    <script>
      function test() { external.invoke("finish"); }
    </script>
  </body>
  </html>
`;

const buffer = Deno.readFileSync(join(ScriptDir, "videos.html"));
html = new TextDecoder("utf-8").decode(buffer);

const webview:Webview = new Webview(
  { 
    // title: string;
    // url: string;
    width: 520,
    height: 960,
    // minWidth: number;
    // minHeight: number;
    // resizable: boolean;
    debug: true,
    // visible: boolean;  
    // frameless: true,
    url: `data:text/html,${encodeURIComponent(html)}`
    // url: "http://localhost/"
    // url: "https://www.zlib.net/crc_v3.txt"
    // url: "https://cn.bing.com/"
  },
);

let dy = new Douyin();
let page = parseInt(Deno.args[0]);
let from = Deno.args[1];

if(!page) page = 64;
if(!from) from = "ekXJViB"; // ekXJHkm: DON'T CHANGE THIS LINE

function updateSelf(){
  let path = join(ScriptDir, "h5.ts");
  let buf = Deno.readFileSync(path);
  let script = new TextDecoder("utf-8").decode(buf);
  script = script.replace(/".+DON'T CHANGE/, `"${from}"; // ekXJHkm: DON'T CHANGE`);
  Deno.writeFileSync(path, new TextEncoder().encode(script));
}

let counter = new Counter(from);
let items: ShareItem[] = [];
let videos: VideoInfo[] = [];

// for await (const event of webview.iter()) { 。。 }
webview.run((event: string) => {
  console.error("⚑", event);
  if(event.startsWith("fetch_video|")){
    let url = event.split("|")[1];
    dy.fetchItem(url).then((json: ItemInfo|void)=>{
      json && webview.eval(`fetch_video_cb(${JSON.stringify(json)})`)
    });
  } else if(event.startsWith("add_favorite|")){
    let from = event.split("/").splice(-2)[0];
    from && dy.addScanList([from]);
  } else if(event.startsWith("favorite|")){
    dy.updateScanList([]).then( (list:ShareItem[]) => {
      items = list;
      webview.eval(`favorite_cb(${JSON.stringify(list)})`);
    });
  } else if(event.startsWith("fetch_aweme|")){
    let aweme_id = event.split("|")[1];
    dy.fetchItemById(aweme_id);
  } else if(event.startsWith("fetch_home|")){
    let url = event.split('|')[1];
    let type = event.split('|')[2] as ("post"|"like");
    dy.fetchHomeList(url, type).then((videos:VideoInfo[]) =>{
      let jsn = JSON.stringify(videos);
      webview.eval(`fetch_home_cb(${jsn})`)
    })
  } else if ("fetch|" === event) {
    dy.scanShareURL(page, from).then((list:ShareItem[]) => {
      from = counter.add(page);
      items = items.concat(...list);
      console.error({page, from, list: items.length});
      if(items.length>200) items.splice(0, 90);
      webview.eval(`fetch_cb(${JSON.stringify(items)})`);
      updateSelf();
    })
  } else if ("End" === event) {
      webview.drop();
  } else if ("test" === event) {
      console.time();
      webview.eval("test();");
  } else if ("finish" === event) {
      console.timeEnd();
  }
});


