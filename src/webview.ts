import { Webview } from "https://deno.land/x/webview/mod.ts";

const html = `
  <html>
  <body style="position:absolute; top:-22px;">
    <button onclick="external.invoke('End')">End</button>
    <button onclick="external.invoke('test')">test</button>
    <script>
      function test() { external.invoke("finish"); }
    </script>
  </body>
  </html>
`;

const webview = new Webview(
  { 
    // title: string;
    // url: string;
    // width: number;
    // height: number;
    // minWidth: number;
    // minHeight: number;
    // resizable: boolean;
    // debug: boolean;
    // visible: boolean;  
    // frameless: true,
    url: `data:text/html,${encodeURIComponent(html)}` },
);
console.log(webview.setTitle)

// for await (const event of webview.iter()) { 。。 }
await webview.run((event) => {
  switch (event) {
    case "End":
      webview.drop();
      break;
    case "test":
      console.time();
      webview.eval("test();");
      break;
    case "finish":
      console.timeEnd();
      break;
  }
});