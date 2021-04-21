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

class Douyin {
  SavePath: string = "videos";
  userAgent: string = "userAgent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36"

  constructor(){
    Deno.mkdirSync(this.SavePath, { recursive: true });
  }

  downloadLikes(homeurl:string){
    this.downloadHome(homeurl, "like");
  }
  downloadPosts(homeurl:string){
    this.downloadHome(homeurl, "post");
  }
  async downloadHome(homeurl:string, type:"post"|"like"){
    let shareurl = await this.fetch_url(homeurl);
    let sec_uid = this.sec_uid(shareurl);
    let uid = this.uid(shareurl);
    // let uid = "59583160290";
    let sign = this.signature_module();
    let signature = Deno.env.get("signature") || sign(uid);
    let aweme_list: VideoInfo[] = [];

    let url = `https://www.iesdouyin.com/web/api/v2/aweme/${type}/?sec_uid=${sec_uid}&count=21&max_cursor=0&aid=1128&_signature=${signature}&dytk=`;
    
    while(true){
      let req = new Request(url);
      req.headers.append("userAgent", this.userAgent);
      let posts = await fetch(req).then(res => res.json() as Promise<Posts>);
      this.log("posts", posts.max_cursor, url);
      aweme_list.push(...posts.aweme_list);
      if(!posts.has_more) break;
      url = url.replace(/max_cursor=\d+/, `max_cursor=${posts.max_cursor}`);
    }

    for(let it of aweme_list){
      // this.log("item", it.aweme_id, it.desc, it.video.play_addr.url_list[0]);
      this.downloadItem(it, homeurl, "");
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
      let infourl = "";
      let match = /\[(\d+)\]/.exec(it);
      let id = match?match[1]:"";
      id && this.iteminfo(id).then(res => {
        infourl = res.url;
        return res.json();
      }).then((it: ItemInfo) => {
        this.downloadItem(it.item_list[0], "", infourl);
      }).catch(e => console.error(e));
    }
  }

  public fetchItem(shorturl: string) {
    fetch(shorturl).then(res => {
      let shareurl = res.url, infourl = "";
      this.log(shorturl, shareurl);
      let id = this.aweme_id(shareurl);
      id && this.iteminfo(id).then(res => {
        infourl = res.url;
        return res.json();
      }).then((it: ItemInfo) => {
        this.downloadItem(it.item_list[0], shorturl, infourl);
      }).catch(e => console.error(e));
      return res.text();
    }).then(function (this: any, text) {
    }).catch(e => console.error(e.message, shorturl));
  }

  async downloadItem(item: VideoInfo, shorturl: string, infourl: string) {
    let videourl = item.video.play_addr.url_list[0];
    videourl = videourl.replace("playwm", "play");
    let uid = item.author.unique_id || item.author.short_id;
    let nickname = item.author.nickname;
    let aweme_id = item.aweme_id;
    let duration = item.video.duration;
    let coverurl = item.video.origin_cover.url_list[0];
    console.log(
      // shorturl,
      nickname,
      uid,
      `[${aweme_id}]`,
      item.desc,
      infourl,
      // videourl
    );
    let cov = await this.get_cover(coverurl, `${this.SavePath}/${uid}-${aweme_id}-${duration}.jpg`);
    let veo = await this.get_video(videourl, `${this.SavePath}/${uid}-${aweme_id}-${duration}.mp4`, false);
    if(veo) this.log(`[${aweme_id}]`, veo.message, item.desc, videourl);
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
  sec_uid(url: string): string {
    let reg = /sec_uid=(.+?)&/;
    let match = reg.exec(url);
    if(match) {
      return match[1];
    }
    return "";
  }
  uid(url: string): string {
    let reg = /share\/user\/(\d+)/;
    let match = reg.exec(url);
    if(match) {
      return match[1];
    }
    return "";
  }
  async iteminfo(id:string): Promise<Response> {
    let url = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${id}`;
    return await fetch(url);
  }
  async get_cover(url: string, name:string) {
    let error = Error("Error when to download cover");
    return fetch(url).then( res => {
      return res.arrayBuffer();
    }).then(async (ab) => {
      let ua8 = new Uint8Array(ab);
      return Deno.writeFile(name, ua8).then(val =>{}).catch(e => {return error});
    }).catch(e => {return error});
  }
  async get_video(url: string, name:string, autoplay = false) {
    let error = Error(`Error when to download video`);
    return fetch(url).then(res => {
      return res.arrayBuffer()
    }).then(async (ab) =>{
      let ua8 = new Uint8Array(ab);
      return Deno.writeFile(name, ua8).then(val => {
        if (!autoplay) return;
        let cmd =  ["cmd", "/c", "start", name];
        const p = Deno.run({
          cmd: cmd,
        }).status();
      }).catch(e => error);
    }).catch(e => error);
  }
  log(...args:any) {
    console.log(...args);
  }
  
  signature_module() {
    let exports = {sign:(s:string):string => ""};
    Function(function(t){return'e(e,a,r){(b[e]||(b[e]=t("x,y","x "+e+" y")(r,a)}a(e,a,r){(k[r]||(k[r]=t("x,y","new x[y]("+Array(r+1).join(",x[y]")(1)+")")(e,a)}r(e,a,r){n,t,s={},b=s.d=r?r.d+1:0;for(s["$"+b]=s,t=0;t<b;t)s[n="$"+t]=r[n];for(t=0,b=s=a;t<b;t)s[t]=a[t];c(e,0,s)}c(t,b,k){u(e){v[x]=e}f{g=,ting(bg)}l{try{y=c(t,b,k)}catch(e){h=e,y=l}}for(h,y,d,g,v=[],x=0;;)switch(g=){case 1:u(!)4:f5:u((e){a=0,r=e;{c=a<r;c&&u(e[a]),c}}(6:y=,u((y8:if(g=,lg,g=,y===c)b+=g;else if(y!==l)y9:c10:u(s(11:y=,u(+y)12:for(y=f,d=[],g=0;g<y;g)d[g]=y.charCodeAt(g)^g+y;u(String.fromCharCode.apply(null,d13:y=,h=delete [y]14:59:u((g=)?(y=x,v.slice(x-=g,y:[])61:u([])62:g=,k[0]=65599*k[0]+k[1].charCodeAt(g)>>>065:h=,y=,[y]=h66:u(e(t[b],,67:y=,d=,u((g=).x===c?r(g.y,y,k):g.apply(d,y68:u(e((g=t[b])<"<"?(b--,f):g+g,,70:u(!1)71:n72:+f73:u(parseInt(f,3675:if(){bcase 74:g=<<16>>16g76:u(k[])77:y=,u([y])78:g=,u(a(v,x-=g+1,g79:g=,u(k["$"+g])81:h=,[f]=h82:u([f])83:h=,k[]=h84:!085:void 086:u(v[x-1])88:h=,y=,h,y89:u({e{r(e.y,arguments,k)}e.y=f,e.x=c,e})90:null91:h93:h=0:;default:u((g<<16>>16)-16)}}n=this,t=n.Function,s=Object.keys||(e){a={},r=0;for(c in e)a[r]=c;a=r,a},b={},k={};r'.replace(/[-]/g,function(m){return t[m.charCodeAt(0)&15]})}("v[x++]=v[--x]t.charCodeAt(b++)-32function return ))++.substrvar .length(),b+=;break;case ;break}".split("")).replace(/return r$/,`this.navigator = {userAgent:"${this.userAgent}"};return r`))()('gr$Daten Иb/s!l y͒yĹg,(lfi~ah`{mv,-n|jqewVxp{rvmmx,&effkx[!cs"l".Pq%widthl"@q&heightl"vr*getContextx$"2d[!cs#l#,*;?|u.|uc{uq$fontl#vr(fillTextx$$龘ฑภ경2<[#c}l#2q*shadowBlurl#1q-shadowOffsetXl#$$limeq+shadowColorl#vr#arcx88802[%c}l#vr&strokex[ c}l"v,)}eOmyoZB]mx[ cs!0s$l$Pb<k7l l!r&lengthb%^l$1+s$jl  s#i$1ek1s$gr#tack4)zgr#tac$! +0o![#cj?o ]!l$b%s"o ]!l"l$b*b^0d#>>>s!0s%yA0s"l"l!r&lengthb<k+l"^l"1+s"jl  s&l&z0l!$ +["cs\'(0l#i\'1ps9wxb&s() &{s)/s(gr&Stringr,fromCharCodes)0s*yWl ._b&s o!])l l Jb<k$.aj;l .Tb<k$.gj/l .^b<k&i"-4j!+& s+yPo!]+s!l!l Hd>&l!l Bd>&+l!l <d>&+l!l 6d>&+l!l &+ s,y=o!o!]/q"13o!l q"10o!],l 2d>& s.{s-yMo!o!]0q"13o!]*Ld<l 4d#>>>b|s!o!l q"10o!],l!& s/yIo!o!].q"13o!],o!]*Jd<l 6d#>>>b|&o!]+l &+ s0l-l!&l-l!i\'1z141z4b/@d<l"b|&+l-l(l!b^&+l-l&zl\'g,)gk}ejo{cm,)|yn~Lij~em["cl$b%@d<l&zl\'l $ +["cl$b%b|&+l-l%8d<@b|l!b^&+ q$sign ',[Object.defineProperty(exports,'__esModule',{value:!0})]);
    return exports.sign;
  }
}

if(Deno.args.length){
  let act = Deno.args[0];
  let dy = new Douyin();
  if("posts"===act){
    dy.downloadPosts(Deno.args[1])
  }else if("likes" === act){
    dy.downloadLikes(Deno.args[1])
  }else if("parse" === act){
    dy.parsePosts(Deno.args[1])
  }else{
    dy.downloadList(Deno.args);
  }
}else{
  console.log(`
  download video from v.douying.com
  set signature=signature=q.Il.AAAy31Nl7qj32qNO6vyJe
  deno run -A douyin.ts parse posts.txt
  deno run -A douyin.ts https://v.douyin.com/eh1PpKh/ https://v.douyin.com/eh1Hs4L/
  deno run -A douyin.ts posts http://v.douyin.com/eh55UYC
  deno run -A douyin.ts likes http://v.douyin.com/ehSh5Cy
  `  );
}


interface Posts {
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

interface ItemInfo {
  status_code: number;
  extra: {
    now: number
    logid: string
  }
  item_list: VideoInfoFull[]
}

interface VideoInfoFull extends VideoInfo {
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

interface VideoInfo {
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

interface Statistics {
    share_count: number
    aweme_id: string
    comment_count: number
    digg_count: number
    play_count: number
}

interface Video {
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

interface Music {
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

interface Author {
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
