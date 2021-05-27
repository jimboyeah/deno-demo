/* 
curl https://v.douyin.com/eh1PBg6/
curl https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=6900049391361559815
curl https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=6794855115779099918

Usage:

deno run -A douyin.ts https://v.douyin.com/eh1PpKh/ https://v.douyin.com/eh1Hs4L/

HOME
Copy Link from User HomePage: 
http://v.douyin.com/ehSh5Cy
https://www.iesdouyin.com/share/user/59583160290?iid=MS4wLjABAAAAfHGThHwzekZzgweoYB1g6dXrgNUxchkGJuRinOKRw64&amp;with_sec_did=1&amp;u_code=19c8clcl7&amp;sec_uid=MS4wLjABAAAA06xUG37YAhRl8nWJ3vEG_CMMJZ47rnxLY96CAvUqoRg&amp;did=MS4wLjABAAAAkVGBM0wz65Lf4cAkKkjl9UZvnxBdSv_V0JBV0iHk8C_nlfAMkrtFY0nJbiRPbW12&amp;timestamp=1618970881&amp;utm_source=copy&amp;utm_campaign=client_share&amp;utm_medium=android&amp;share_app_name=douyin

https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid=MS4wLjABAAAA06xUG37YAhRl8nWJ3vEG_CMMJZ47rnxLY96CAvUqoRg
https://www.iesdouyin.com/web/api/v2/aweme/licke/?sec_uid=MS4wLjABAAAA06xUG37YAhRl8nWJ3vEG_CMMJZ47rnxLY96CAvUqoRg
https://www.iesdouyin.com/web/api/v2/aweme/post/?sec_uid=MS4wLjABAAAA06xUG37YAhRl8nWJ3vEG_CMMJZ47rnxLY96CAvUqoRg&count=21&max_cursor=0&aid=1128&_signature=VHoupQAANAiyH7H6JvRmvVR6Lr&dytk=

URL 签名 signature 随时间变化动态生成，可以在页面使用调式工具设置 fetch breakpoints，再根据调用栈定位到 init 方法：

    function init(config) {
      dytk = config.dytk;
      params.user_id = config.uid;
      params.sec_uid = _utils2.default.getUrlParam(window.location.href, "sec_uid");

      if (params.sec_uid != "") {
        delete params.user_id;
      }

      config.sec_uid = params.sec_uid;
      nonce = config.uid;
      signature = (0, _bytedAcrawler.sign)(nonce);
      // ...
    }

根据打包机嵌入的信息找到 bytedAcrawler 的实现，其导出模块位置 vendor.a59687bc.js:1096。

所谓模块，就是一个独立命名空间的闭包，在需要使用时就请求加载它。将模块提取出来，用它对 uid 进行处理就可以得到签名。

模块提供的是混淆过的代码，参考 JavaScript Obfuscator Tool  https://obfuscator.io

由于 bytedAcrawler 提供的签名算法借用了浏览器对象 navigator 来保证算法运行环境为浏览器，否则尝试读取 userAgent 会导致运行出错，实现了运行环境安全。

通过逆向，即像脚本引擎一样破解算法内部，只需给代码打一个补订即可解决，不过时间也是花了大半天：

    .replace(/return r$/,"this.navigator = {userAgent:''};return r")

SHARE
https://www.iesdouyin.com/share/video/6715818142016212237/
https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=6715818142016212237

*/
import { join, dirname, fromFileUrl } from "https://deno.land/std@0.95.0/path/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";

export default class Douyin {
  MaxItems = 200;
  Force = false;
  ScriptDir:string;
  SavePath: string = "videos";
  userAgent: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"
  record;

  constructor(){
    this.ScriptDir = dirname(fromFileUrl(Deno.mainModule))
    this.record = this.parsePostsRecord(join(this.ScriptDir,"posts.txt"));
    Deno.mkdirSync(this.SavePath, { recursive: true });
  }

  downloadForce(ids:string[]){
    this.Force = true;
    for (let id of ids) {
      try{
        this.fetchItemById(id);
      }catch(e){ console.error("Error when process item", id, e.message); }
    }
  }
  downloadLikes(homeurl:string){
    this.downloadHome(homeurl, "like");
  }
  downloadPosts(homeurl:string){
    this.downloadHome(homeurl, "post");
  }
  homeListUrl(homeurl:string, type:"post"|"like"){
    let sec_uid = this.sec_uid(homeurl);
    if(sec_uid === false) return false;
    // let uid = this.uid(homeurl);
    // let sign = this.signature_module();
    let signature = Deno.env.get("signature") || (/* sign(uid), */ "R8qxlhATHPXt5fEW4KBhFkfKsY");
    let url = `https://www.iesdouyin.com/web/api/v2/aweme/${type}/?sec_uid=${sec_uid}&count=21&max_cursor=0&aid=1128&_signature=${signature}&dytk=`;
    return url;
  }
  async fetchHomeList(homeurl:string, type:"post"|"like"){
    let shareurl = await this.fetch_url(homeurl);
    let url = this.homeListUrl(shareurl, type) as string;
    let aweme_list: VideoInfo[] = [];

    let current = this.MaxItems;
    while(true){
      let req = new Request(url);
      req.headers.append("User-Agent", this.userAgent);
      let posts = await fetch(req).then(res => res.json() as Promise<Posts>);
      this.error("posts", posts.aweme_list.length, posts.max_cursor, url);
      aweme_list.push(...posts.aweme_list);
      current -= posts.aweme_list.length;
      if(!posts.has_more || (current)<0) break;
      url = url.replace(/max_cursor=\d+/, `max_cursor=${posts.max_cursor}`);
    }
    return aweme_list;
  }
  async downloadHome(homeurl:string, type:"post"|"like"){
    let aweme_list = await this.fetchHomeList(homeurl, type);
    for(let it of aweme_list){
      if(this.record[it.aweme_id]) {
        this.error("item was downloaded", it.aweme_id);
        continue;
      }
      this.fetchItemById(it.aweme_id);
      // this.downloadItem(it, homeurl).catch(e => console.log(e.message));
    }
  }
  downloadList(list:string[]){
    for (let url of list) {
      try{
        this.fetchItem(url);
      }catch(e){ console.error("Error when process item", url, e.message); }
    }
  }
  parsePosts(file:string){
    const buffer = Deno.readFileSync(file);
    const decoder = new TextDecoder("utf-8");
    let lines = decoder.decode(buffer).split('\n');
    for(let it of lines){
      if(it.indexOf("[last parse]")>=0){
        return this.log("tag found:", it);
      }
      let match = /\[(\d+)\]/.exec(it);
      let id = match?match[1]:"";
      this.fetchItemById(id);
    }
  }
  parsePostsRecord(file:string){
    let record:{[key: string]:boolean} = {};
    if(this.Force || !existsSync(file)) return record;
    let buffer;
    try{
      buffer = Deno.readFileSync(file);
    }catch(e) {
      this.log(file, e.message);
      return record;
    }
    const decoder = new TextDecoder("utf-8");
    let lines = decoder.decode(buffer).split('\n');
    let tag = false;
    for(let it of lines){
      if(!tag){
        tag = it.indexOf("[last parse]")>=0;
        continue;
      }
      // find [last parse]
      let match = /\[(\d+)\]/.exec(it);
      match &&(record[match[1]] = true);
    }
    return record;
  }

  async fetchItem(shorturl: string) {
    return fetch(shorturl).then(res => {
      let shareurl = res.url;
      // this.log(shorturl, shareurl);
      let id = this.aweme_id(shareurl);
      return this.fetchItemById(id);
    //  return res.text();
    //}).then(function (this: any, text) {
    //  return text;
    }).catch(e => console.error(e.message, shorturl));
  }
  
  public fetchItemById(aweme_id: string) {
    let infourl = aweme_id;
    return this.iteminfo(aweme_id).then((it: ItemInfo) => {
      let videoinfo = it.item_list[0];
      let uid = videoinfo.author.unique_id || videoinfo.author.short_id;
      this.save(`${this.SavePath}/${uid}-${aweme_id}.json`, JSON.stringify(it));
      this.downloadItem(videoinfo, infourl).catch(e => console.log(e.message));
      return it;
    }).catch(e => console.error(`${e.message} [${aweme_id}] ${infourl}`));
  }

  async downloadItem(item: VideoInfo, infourl: string): Promise<boolean | Error> {
    if(!item){
      return Error("download fail: "+infourl);
    }
    let videourl = item.video.play_addr.url_list[0];
    videourl = videourl.replace("playwm", "play");
    let uid = item.author.unique_id || item.author.short_id;
    let nickname = item.author.nickname;
    let aweme_id = item.aweme_id;
    let duration = item.video.duration;
    let coverurl = item.video.origin_cover.url_list[0];
    console.log(
      nickname, uid, `[${aweme_id}]`, item.desc,
      // infourl, videourl
    );
    let cov = await this.get_cover(coverurl, `${this.SavePath}/${uid}-${aweme_id}-${duration}.jpg`);
    let veo = await this.get_video(videourl, `${this.SavePath}/${uid}-${aweme_id}-${duration}.mp4`);
    if(veo) {
      return Error(`[${aweme_id}]${veo.message} ${item.desc} ${videourl}`);
    }
    return true;
  }

  async fetch_url(shorturl:string) {
    return fetch(shorturl).then(res => res.url);
  }

  aweme_id(url: string): string {
    let reg = /share\/video\/(.+?)\//;
    let match = reg.exec(url);
    if(match) {
      return match[1];
    }
    return "";
  }
  sec_uid(url: string): string | boolean {
    let reg = /sec_uid=([\w_-]+)/;
    let match = reg.exec(url);
    if(match) {
      return match[1];
    }
    return false;
  }
  uid(url: string): string {
    let reg = /share\/user\/(\d+)/;
    let match = reg.exec(url);
    if(match) {
      return match[1];
    }
    return "";
  }
  async iteminfo(id:string): Promise<ItemInfo> {
    let url = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${id}`;
    return fetch(url).then(res => {
      return res.json() as Promise<ItemInfo>;
    });
  }
  async get_cover(url: string, name:string) {
    let error = Error("Error when to download cover");
    return fetch(url).then( res => {
      return res.arrayBuffer();
    }).then(async (ab) => {
      this.save(name, ab);
    }).catch(e => {return error});
  }
  async get_video(url: string, name:string) {
    let error = Error(`Error when to download video`);
    return fetch(url).then(res => {
      return res.arrayBuffer()
    }).then(async (ab) =>{
      this.save(name, ab);
    }).catch(e => error);
  }
  log(...args:any) {
    console.log(...args);
  }
  error(...args:any) {
    console.error(...args);
  }
  save(name:string, data:ArrayBuffer|Uint8Array|string){
    if(data instanceof ArrayBuffer){
      data = new Uint8Array(data);  
    }else if("string" === typeof data){
      let te = new TextEncoder();
      data = new Uint8Array(te.encode(data));
    }
    Deno.writeFile(name, data as Uint8Array);
  }
  start(name:string){
    let cmd =  ["cmd", "/c", "start", name];
    const p = Deno.run({
      cmd: cmd,
    }).status();
  }

  parseM3U8(m3u8:string){
    const buffer = Deno.readFileSync(m3u8);
    const decoder = new TextDecoder("utf-8");
    let lines = decoder.decode(buffer).split("\n");
    let index = 1;
    for (let it of lines){
      if(it.indexOf("http")<0){
        continue;
      }
      // let match = /(http\w+)/.exec(it);
      // let url = match?match[1]:"";
      // let name = (index++)+"."+(it.trim().split(".").pop() || "tmp");
      let name = (index++)+".ts";
      name = join(this.SavePath, ("0000"+name).substr(-7));
      if(existsSync(name)){
        console.log("pass", name);
        continue;
      }
      console.log(index, name, it);
      fetch(it).then(res => {
        return res.arrayBuffer()
      }).then(async (ab) =>{
        ab = new Uint8Array(ab, 0x77);
        this.save(name, ab);
      }).catch(console.log);
      // this.get_video(it, name).catch(console.log);
    }
  }

  async scanShareURL(count = 10000, from:string|string[] = "0000000"){
    let items:Promise<any>[] = [];
    let saved:ShareItem[] = [];
    if(from instanceof Array){
      saved = await this.addScanList(from);
      from = from.slice(-1)[0];
    }
    let counter = new Counter(from);
    for (let index = 0; index < count; index++) {
      // let item = await this.tryShareURL(from);
      let item = this.tryShareURL(from);
      items.push(item);
      from = counter.add();
    }
    let list = await this.conductScanList(items);
    list = saved.concat(...list);
    console.log(JSON.stringify(list, null, "  "));
    return list;
  }

  async addScanList(from: string[]){
    let items:Promise<any>[] = [];
    for (const it of from) {
      items.push(this.tryShareURL(it));
    }
    let list = await this.conductScanList(items);
    return this.updateScanList(list);
  }

  async conductScanList(items:Promise<any>[]){
    let list:ShareItem[] = [];
    await Promise.allSettled(items).then(e => {
      for (const it of e) {
        if(it.status==="fulfilled") {
          list.push(it.value);
        }else{
          console.error(it.status, it.reason.message)
        }
      }
    });
    return list;
  }

  async updateScanList(list:ShareItem[]){
    let path = join(this.ScriptDir, "scan.json");
    let buf = Deno.readFileSync(path);
    let scan = JSON.parse(new TextDecoder("utf-8").decode(buf));
    scan = scan.concat(...list);
    let userids:{[key:string]: boolean} = {};
    let res: ShareItem[] = [];
    for (const it of scan) {
      if(userids[it.uid] || it.type=="video") continue;
      userids[it.uid] = true;
      res.push(it);
    }
    let txt =  new TextEncoder().encode(JSON.stringify(res, null, '  '));
    Deno.writeFileSync(path, txt)
    return res;
  }

  async tryShareURL(tag:string): Promise<ShareItem|Error|null>{
    let url = `https://v.douyin.com/${tag}/`;
    let init:RequestInit = {
      // method: "POST",
      // redirect: "manual",
      headers:{
        "user-agent": this.userAgent
      },
      // referrer: "https://www.douyin.com/"
    }
    let req = new Request(url, init);
    return fetch(req).then(res =>{
      if(res.url.indexOf("/404")>=0 || res.status == 404){
        throw Error("404 " + url);
      }
      return res.url;
    }).then(shareurl => {
      if (shareurl.indexOf("/share/video/")>=0){
        let aweme_id = this.aweme_id(shareurl);
        return this.iteminfo(aweme_id).then(iteminfo => {
          let item = iteminfo.item_list[0];
          if(!item) throw Error("noposts " + url);
          let author = item.author;
          let video = item.video;
          let uid = author.unique_id || author.short_id;
          let videourl = video.play_addr.url_list[0].replace("playwm", "play");
          let cover = video.cover.url_list[0];
          let nickname = author.nickname;
          let desc = item.desc;
          let json:ShareItem = {type:"video", nickname, uid, desc, url, cover};
          // this.log(JSON.stringify(json, null, '  '), ",");
          return json;
        }).catch(e => {
          // console.log(e.message, shareurl);
          throw e;
        })
      }else if(shareurl.indexOf("/share/user/")>=0){
        let listurl = this.homeListUrl(shareurl, "post");
        if(listurl === false){
          // this.log("broken", shareurl);
          throw Error("broken " + shareurl); 
        }
        // this.log("user", url);
        return fetch(listurl).then( res => res.json() as Promise<Posts> ).then(posts => {
          let item = posts.aweme_list[0];
          if(!item) throw Error("noposts " + url);
          let author = item.author;
          let uid = author.unique_id || author.short_id;
          let cover = author.avatar_larger.url_list[0];
          let nickname = author.nickname;
          let desc = author.signature
          let json: ShareItem = {type:"user", nickname, uid, desc, url, cover};
          // this.log(JSON.stringify(json, null, '  '), ",");
          return json;
        }).catch(e => {
          // console.log(e.message, listurl);
          throw e;
        })
      }else{
        // if(shareurl.indexOf("/share/invite/")>=0){
        // this.log("shareurl", url, shareurl.split("?")[0]);
        throw Error("shareurl " + shareurl.split("?")[0])
      }
    }).catch(e => {throw e})
  }
  

  signature_module() {
    let exports = {sign:(s:string):string => ""};
    Function(function(t){return'e(e,a,r){(b[e]||(b[e]=t("x,y","x "+e+" y")(r,a)}a(e,a,r){(k[r]||(k[r]=t("x,y","new x[y]("+Array(r+1).join(",x[y]")(1)+")")(e,a)}r(e,a,r){n,t,s={},b=s.d=r?r.d+1:0;for(s["$"+b]=s,t=0;t<b;t)s[n="$"+t]=r[n];for(t=0,b=s=a;t<b;t)s[t]=a[t];c(e,0,s)}c(t,b,k){u(e){v[x]=e}f{g=,ting(bg)}l{try{y=c(t,b,k)}catch(e){h=e,y=l}}for(h,y,d,g,v=[],x=0;;)switch(g=){case 1:u(!)4:f5:u((e){a=0,r=e;{c=a<r;c&&u(e[a]),c}}(6:y=,u((y8:if(g=,lg,g=,y===c)b+=g;else if(y!==l)y9:c10:u(s(11:y=,u(+y)12:for(y=f,d=[],g=0;g<y;g)d[g]=y.charCodeAt(g)^g+y;u(String.fromCharCode.apply(null,d13:y=,h=delete [y]14:59:u((g=)?(y=x,v.slice(x-=g,y:[])61:u([])62:g=,k[0]=65599*k[0]+k[1].charCodeAt(g)>>>065:h=,y=,[y]=h66:u(e(t[b],,67:y=,d=,u((g=).x===c?r(g.y,y,k):g.apply(d,y68:u(e((g=t[b])<"<"?(b--,f):g+g,,70:u(!1)71:n72:+f73:u(parseInt(f,3675:if(){bcase 74:g=<<16>>16g76:u(k[])77:y=,u([y])78:g=,u(a(v,x-=g+1,g79:g=,u(k["$"+g])81:h=,[f]=h82:u([f])83:h=,k[]=h84:!085:void 086:u(v[x-1])88:h=,y=,h,y89:u({e{r(e.y,arguments,k)}e.y=f,e.x=c,e})90:null91:h93:h=0:;default:u((g<<16>>16)-16)}}n=this,t=n.Function,s=Object.keys||(e){a={},r=0;for(c in e)a[r]=c;a=r,a},b={},k={};r'.replace(/[-]/g,function(m){return t[m.charCodeAt(0)&15]})}("v[x++]=v[--x]t.charCodeAt(b++)-32function return ))++.substrvar .length(),b+=;break;case ;break}".split("")).replace(/return r$/,`this.navigator = {userAgent:"${this.userAgent}"};return r`))()('gr$Daten Иb/s!l y͒yĹg,(lfi~ah`{mv,-n|jqewVxp{rvmmx,&effkx[!cs"l".Pq%widthl"@q&heightl"vr*getContextx$"2d[!cs#l#,*;?|u.|uc{uq$fontl#vr(fillTextx$$龘ฑภ경2<[#c}l#2q*shadowBlurl#1q-shadowOffsetXl#$$limeq+shadowColorl#vr#arcx88802[%c}l#vr&strokex[ c}l"v,)}eOmyoZB]mx[ cs!0s$l$Pb<k7l l!r&lengthb%^l$1+s$jl  s#i$1ek1s$gr#tack4)zgr#tac$! +0o![#cj?o ]!l$b%s"o ]!l"l$b*b^0d#>>>s!0s%yA0s"l"l!r&lengthb<k+l"^l"1+s"jl  s&l&z0l!$ +["cs\'(0l#i\'1ps9wxb&s() &{s)/s(gr&Stringr,fromCharCodes)0s*yWl ._b&s o!])l l Jb<k$.aj;l .Tb<k$.gj/l .^b<k&i"-4j!+& s+yPo!]+s!l!l Hd>&l!l Bd>&+l!l <d>&+l!l 6d>&+l!l &+ s,y=o!o!]/q"13o!l q"10o!],l 2d>& s.{s-yMo!o!]0q"13o!]*Ld<l 4d#>>>b|s!o!l q"10o!],l!& s/yIo!o!].q"13o!],o!]*Jd<l 6d#>>>b|&o!]+l &+ s0l-l!&l-l!i\'1z141z4b/@d<l"b|&+l-l(l!b^&+l-l&zl\'g,)gk}ejo{cm,)|yn~Lij~em["cl$b%@d<l&zl\'l $ +["cl$b%b|&+l-l%8d<@b|l!b^&+ q$sign ',[Object.defineProperty(exports,'__esModule',{value:!0})]);
    return exports.sign;
  }
}

export class Counter {
  Table: string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  Its: number[];

  constructor(from:string, table:string=""){
    table != "" && (this.Table = table);
    this.Its = from.split("").map((it, ik, its)=>{
      return this.Table.indexOf(it);
    });
  }

  add(val = 1){
    let its = this.Its;
    let len = its.length;
    let mod = this.Table.length;
    let carry = val;
    its.forEach((it, ik, its)=>{
      let ix = len-ik-1;
      its[ix] += carry;
      if (its[ix] >= mod) {
        let m = its[ix] % mod;
        carry = (its[ix] - m)/mod;
        its[ix] = m;
      }else{
        carry = 0;
      }
    });
    carry && its.unshift(carry);
    return its.map((it) => this.Table.charAt(it)).join("");
  }
}

if(import.meta.main && Deno.args.length){
  let act = Deno.args[0];
  let dy = new Douyin();
  if("posts"===act){
    dy.downloadPosts(Deno.args[1])
  }else if("likes" === act){
    dy.downloadLikes(Deno.args[1])
  }else if("parse" === act){
    dy.parsePosts(Deno.args[1])
  }else if("m3u8" === act){
    dy.parseM3U8(Deno.args[1])
  }else if("force" === act){
    dy.downloadForce(Deno.args.slice(1))
  }else if("scan" === act){
    let from = (Deno.args.length>3)? Deno.args.slice(2): Deno.args[2];
    dy.scanShareURL(parseInt(Deno.args[1]), from)
  }else{
    dy.downloadList(Deno.args);
  }
}else{
  console.log(`
  download video from v.douying.com
  set signature=signature=q.Il.AAAy31Nl7qj32qNO6vyJe
  deno run -A douyin.ts parse posts.txt
  deno run -A douyin.ts scan 2 e5EmMdo ekXJHkm ekPAVcG
  deno run -A douyin.ts m3u8 play.m3u8
  deno run -A douyin.ts https://v.douyin.com/eh1PpKh/ https://v.douyin.com/eh1Hs4L/
  deno run -A douyin.ts posts https://v.douyin.com/eh55UYC
  deno run -A douyin.ts likes https://v.douyin.com/ehSh5Cy
  deno run -A douyin.ts likes https://v.douyin.com/ehCbUjE/
  deno170 run -A --unstable demos/src/douyin/h5.ts 124 ekXJHkm>out.md
  `);
  let tag = new RegExp("记录美好生活！ (http://v.douying.com/.+?/)");
  // Deno.readTextFile("")
}


export interface ShareItem {
  type: "video"|"user", 
  nickname: string, 
  uid: string, 
  url: string,
  desc: string, 
  cover: string, 
}
export interface ShareUser extends ShareItem {
  avatar: string
}
export interface ShareVideo extends ShareItem {
  videourl:string,
}

export interface Posts {
  has_more: boolean
  extra: {
    now: number
    logid: string
  },
  status_code: number
  aweme_list: VideoInfo[]
  max_cursor: number
  min_cursor: number
}

export interface ItemInfo {
  status_code: number;
  extra: {
    now: number
    logid: string
  }
  item_list: VideoInfoFull[]
}

export interface VideoInfoFull extends VideoInfo {
  share_info: {
    share_weibo_desc: string
    share_desc: string
    share_title: string
  }
  risk_infos: { 
    warn: boolean
    type: number
    content: string
  }
  music: Music
  author_user_id: number
  create_time: number
  duration: number
  forward_id: string,
  group_id: number,
  is_live_replay: boolean,
  is_preview: number,
  share_url: string
}

export interface VideoInfo {
  author: Author
  video: Video
  statistics: Statistics,
  aweme_id: string
  aweme_type: number
  cha_list: object,
  comment_list: object,
  desc: string
  geofencing: object,
  image_infos: object,
  images: object,
  label_top_text: object,
  long_video: object,
  promotions: object,
  text_extra: string[],
  video_labels: object,
  video_text: string,
}

export interface Statistics {
    share_count: number
    aweme_id: string
    comment_count: number
    digg_count: number
    play_count: number
}

export interface Video {
    duration: number
    vid: string
    cover: {
      uri: string
      url_list: string[]
    }
    dynamic_cover: {
      uri: string
      url_list: string[]
    }
    origin_cover: {
      uri: string
      url_list: string[]
    }
    has_watermark: true
    bit_rate: null
    play_addr: {
      url_list: string[]
      uri: string
    }
    ratio: string
    width: number
    height: number
}

export interface Music {
    title: string
    author: string
    cover_thumb: {
      uri: string
      url_list: string[]
    },
    duration: number,
    mid: string
    cover_hd: {
      url_list: string[],
      uri: string
    },
    cover_large: {
      uri: string
      url_list: string[]
    },
    cover_medium: {
      uri: string
      url_list: string[]
    },
    play_url: {
      url_list: string[],
      uri: string
    },
    position: object,
    status: number,
    id: number
}

export interface Author {
  uid: string
  short_id: string
  nickname: string
  avatar_larger: {
    uri: string
    url_list: string[]
  },
  avatar_thumb: {
    url_list: string[]
    uri: string
  },
  avatar_medium: {
    uri: string
    url_list: string[]
  },
  followers_detail: object,
  platform_sync_info: object,
  policy_version: object,
  type_label: object,
  geofencing: object
  signature: string
  unique_id: string
}
