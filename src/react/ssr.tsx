import React from 'https://dev.jspm.io/react'
import { serve } from "https://deno.land/std@0.51.0/http/server.ts";
import ReactDOMServer from 'https://dev.jspm.io/react-dom/server'
import { App } from './App.tsx'

export const str = ReactDOMServer.renderToString(<App />);

const body = new TextEncoder().encode(str);
const s = serve(":8080");
window.onload = async () => {
  console.log("http://localhost:8080/");
  for await (const req of s) {
    req.respond({ body });
  }
};