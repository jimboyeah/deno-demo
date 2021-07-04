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
console.error("load page", html.split("\n").shift());

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

let favorite = await dy.updateScanList([]);
let scanList:ShareItem[] = [];
let fromfile = Deno.args[0]=="fromfile";
if( fromfile ){
  let file = Deno.args[1];
  let txt = Deno.readTextFileSync(file);
  let list = JSON.parse(txt);
  scanList = scanList.concat(...list);
  console.log("load scanlist", scanList.length, list.length);
}

if(!page) page = 62;
if(!from || fromfile) from = "emPoLXp"; // ekXJHkm: DON'T CHANGE THIS LINE

function updateSelf(){
  let path = join(ScriptDir, "h5.ts");
  let buf = Deno.readFileSync(path);
  let script = new TextDecoder("utf-8").decode(buf);
  script = script.replace(/".+DON'T CHANGE/, `"${from}"; // ekXJHkm: DON'T CHANGE`);
  Deno.writeFileSync(path, new TextEncoder().encode(script));
}

let counter = new Counter(from);
let items: ShareItem[] = [];
let lastEvent = "";

// for await (const event of webview.iter()) { 。。 }
webview.run((event: string) => {
  if(lastEvent === event) return;
  setTimeout(() => {
    lastEvent = "";
  }, 200);
  console.error("⚑", event);
  lastEvent = event;
  if(event.startsWith("fetch_video|")){
    let url = event.split("|")[1];
    dy.fetchItem(url).then((json: ItemInfo|void)=>{
      json && webview.eval(`fetch_video_cb(${JSON.stringify(json)})`)
    });
  } else if(event.startsWith("add_favorite|")){
    let from = event.split("|")[1].split("/").splice(-2)[0];
    from && dy.scanFavoriteList([from]).then(it => {
      webview.eval(`add_favorite_cb(${it})`);
    });
  } else if(event.startsWith("favorite|")){
    items = favorite.splice(0);
    webview.eval(`favorite_cb(${JSON.stringify(items)})`);
  } else if(event.startsWith("fetch_aweme|")){
    let aweme_id = event.split("|")[1];
    dy.fetchItemById(aweme_id).then((item:void|ItemInfo)=>{
      webview.eval(`fetch_aweme_cb(${JSON.stringify(item)})`);
    });
  } else if(event.startsWith("fetch_home|")){
    let url = event.split('|')[1];
    let type = event.split('|')[2] as ("post"|"like");
    dy.fetchHomeList(url, type).then((videos:VideoInfo[]) =>{
      let jsn = JSON.stringify(videos);
      webview.eval(`fetch_home_cb(${jsn})`)
    })
  } else if ("fetch|" === event && scanList.length) {
    items = items.concat(...scanList.splice(0, 24));
    console.error({ items: items.length, scanList: scanList.length});
    if(items.length>200) items.splice(0, 24);
    webview.eval(`fetch_cb(${JSON.stringify(items)})`);
  } else if ("fetch|" === event && !scanList.length) {
    // dy.scanShareURL(page, from).then((list:ShareItem[]) => {
    dy.scanInSubproce(from, page).then((list:ShareItem[]) => {
      items = items.concat(...list);
      console.error({ found: list.length, from, list: items.length, page});
      if(items.length>200) items.splice(0, 24);
      webview.eval(`fetch_cb(${JSON.stringify(items)})`);
      updateSelf();
    })
    from = counter.add(page);
  } else if ("End" === event) {
      webview.drop();
  } else if ("test" === event) {
      console.time();
      webview.eval("test();");
  } else if ("finish" === event) {
      console.timeEnd();
  }
});


