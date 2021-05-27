/*
 * jQuery JavaScript Library v1.3.2 required
 *
 * Copyright (c) 2009 Jimbo
 * Dual licensed under the MIT and GPL licenses.
 *
 * Date: 2010-4-9 18:05 (Fri, 9 April 2010)
 * Revision: 0.1
 * Update:2012/7/12 11:03:15
 * USAGE:
 *
    $('DOM_ID').anyscroll({
      width:640,
      height:320,
      //more settings ...
      axis:'y'
    }

 * NOTE:
 *  my Jany.js may use for animation
 * 
 * Update:2012/7/12 11:03:15
 * Add hideController(), showController(), and autoHideController if content size is less than specified;
 * 
 * Update: 2010-5-5 10:45
 * Content: redesign nob's size mode and scrolling action effect
 * 
 * Update: 2010-5-7 13:37
 * Content: implemtate mouse wheel and dragable rolling
 * 
 * Update: 2011/12/19
 *  fixed bugs which was reported from Melvin.Yan:
 *  content dynamic script affected
 * 
 * BUGS:
 *  + DD_belatedPNG crash if png inside anyscroll.
 *    - init anyscroll before node tree append
 *  + crash in jQuery high version 1.5.
 *  + mousewheel unstable if anyscroll was covered with another content that has a effectual z-index.
 *    - rearrenge you content z-index, and set background to you content/anyscroll.
 * 
 */

$.fn.anyscroll = function(options){
  if(this.length==0) return ; //for empty dom element
  //TODO:transfer every dom in this jquery object but this[0]
  var dom = this[0];
  var context = this; //jQuery extended
  //Another method to write you own jQuery plugin:
  // $.fn.extend({plugin_object});
  //This method will extend jQuery itself with plugin_object

  ////////////////////////AnyScroll Settings////////////////////////////
  this.settings = {
    onscroll:function(){},//default scroll event
    width:800, height:600,//size of content 
    axis:"y", //direction of scrolling
    roll:true,//use mouse wheel for true
    dragable:false,//use mouse left button to scroll
    clickable:true,//click track to scroll
    autoHideController:true,//hide controller if content is too tiny
    interval:24,//space between content and control
    tick:24,//space between each wheel
    spend:0, //delay for a scrolling
    head:0,//nob space of it head
    tail:0,//nob space of ti tail
    spinsize:{small:8,big:64}, //size of the nob
    nobcss:'',trackcss:'', innercss:'', outercss:'',
    trackthick:1 //board width of track nob obey
  };
  $.fn.extend(this.settings,options);
  var sets = this.settings;
    sets.nobmaxheight = sets.height-sets.head-sets.tail-sets.spinsize.big-2; //2px for border each side
    sets.nobmaxwidth = sets.width-sets.head-sets.tail-sets.spinsize.big-2;

  ///////////////////////////////initialization///////////////////////////
  var nobcss='border:1px solid #444;', trackcss='position:relative;';
  var innercss='position:relative;overflow:hidden;'+'width:'+sets.width+'px;height:'+sets.height+'px;';
  var outercss='position:relative;';

  if (sets.axis=="y") {
    nobcss += "width:"+sets.spinsize.small+"px;height:"+sets.spinsize.big+"px;font-size:0px;"+sets.nobcss;
    trackcss += 'float:right;height:'+ (sets.height-sets.head-sets.tail)+'px;margin-top:'+sets.head+'px;border-right:solid #444 '+sets.trackthick+'px;'+sets.trackcss;
    innercss += 'margin-right:'+sets.interval+"px;"+sets.innercss;
    outercss += 'width:'+(sets.width+sets.interval+sets.spinsize.small)+'px;height:'+ sets.height+'px;'+sets.outercss;
  }else if(sets.axis=="x"){
    nobcss += "width:"+sets.spinsize.big+"px;height:"+sets.spinsize.small+"px;font-size:0px;"+sets.nobcss;
    trackcss += 'height:4px;width:'+ (sets.width-sets.head-sets.tail)+'px;margin-left:'+sets.head+'px;border-bottom:solid #444 '+sets.trackthick+'px;'+sets.trackcss;
    innercss += 'margin-bottom:'+sets.interval+"px;"+sets.innercss;
    outercss += 'width:'+(sets.width)+'px;height:'+ (sets.height+sets.interval+sets.spinsize.small)+'px;'+sets.outercss;
  }

  this.nob = $('<div style="left:0px;top:0px;'+nobcss+
    '" />')
    .attr("class","anynob").css("position","absolute")
    .bind("mousedown",function(event){drag.call(context,event);});
  //为了，使nob限定在track指定的区域，我须要一个shadow来作探测器。
  this.shadow = this.nob.clone()
    .attr("class","anyshadow")
    .css("visibility","hidden");//.css("left",sets.spinsize.big)
  this.track = $('<div style="'+trackcss+'" />')
    .attr("class","anytrack")
    .append(this.nob)
    .append(this.shadow);
  if(sets.clickable)this.track.click(click);
  this.road = $('<div style="overflow:hidden;text-align:left;background:white;'+
    'position:absolute;top:0px;left:0px;'+
    (sets.dragable?'filter:alpha(opacity=0);opacity:0;':'visibility:hidden;')+
    'width:'+sets.width+'px;height:'+sets.height+'px;" />')
    .attr("class","anyroad");
    //.bind("mouseover",over)
    //.bind("mouseout",out)
    //.bind("DOMMouseScroll",rolling)
    //.bind("mousewheel",rolling);

  //capture for dragable of left mouse button
  var onmousewheel = (document.addEventListener?"DOMMouseScroll":"onmousewheel");
  //alert("onmousewheel="+onmousewheel);
  if(sets.dragable) Capture(
    {name:'onmousedown',fun:over},
    {name:'onmousemove',fun:rolling},
    {name:'onmouseup',fun:out},
    this.road[0]
  );

  this.inner = $('<div style="'+innercss+'" />')
  .attr("class","anyinner");
  /*capture for mouse wheel
  if(sets.roll) Capture(
    {name:'onmouseover',fun:over},
    {name:onmousewheel,fun:rolling},
    {name:'onmouseout',fun:out},
    this.road[0]
  );*/
  if(sets.roll) bind(this.inner[0],onmousewheel,rolling);

  this.outer = $('<div style="'+outercss+'" />')
    .attr("id","anyouter")
    .append(this.track)
    .append(this.inner);
  if(sets.axis=="x")this.outer.append(this.track);

  //to keep dynamic script use appendChild instaed jQuery.html()
  //$(dom).html(""); //Clear inner HTML of current DOM object
  //dom.parentNode.appendChild(this.outer[0],dom); //Append this object create here
  dom.parentNode.insertBefore(this.outer[0],dom);

  this.inner.append(dom) //TRANSFER ONLY ONE DOM NODE
  .append(this.road);

  //after execute DOM, then we can get/set attribute savely
  //this.track.offsetTop = this.track[0].offsetTop;
  //log.info(this.nob[0].offsetTop);

  ////////////////////////////public methods //////////////////////////////
  this.scrollTo = function(delta,type){
    if(typeof(chill)!="undefined") { //use Jany.js for animation
      var from = parseInt(sets.axis=="y"? this.nob[0].style.top:this.nob[0].style.left);
      var type = type||"linear";
      new chill(function(v){scrollTo(v,v);},{to:delta,from:from,type:type})
    }else
      scrollTo(delta,delta);
  };
  this.hideController = function(){
    //this.track.css("visibility","hidden");
    if(this.isControllerHidden) return;
    this.isControllerHidden = true;
    this.inner.anyRight = this.inner[0].style.marginRight;
    this.inner.anyBottom = this.inner[0].style.marginBottom;
    this.inner.css("marginRight","0");
    this.inner.css("marginLeft","0");
    //this.inner.anyHeight = this.inner.height();
    //this.inner.anyWidth = this.inner.width();
    //this.inner.css("width",sets.width);
    //this.inner.css("height",sets.height);
    this.track.css("display","none");
  }
  this.showController = function(){
    //this.track.css("visibility","visible");
    if(!this.isControllerHidden) return;
    this.isControllerHidden = false;
    this.inner.css("marginRight",this.inner.anyRight);
    this.inner.css("marginLeft",this.inner.anyLeft);
    //this.inner.css("width",this.inner.anyWidth);
    //this.inner.css("height",this.inner.anyHeight);
    this.track.css("display","block");
  }


  ////////////////////////////final settings //////////////////////////////
  //if(sets.autoHideController&&$(dom).height()<sets.height) this.hideController();
  //if(sets.autoHideController&&$(dom).width()<sets.width) this.hideController();
  //var dynamic_hidden = false;
  if(sets.autoHideController){
    var frameRate = 1000/12;
    setTimeout(function(){
      //document.title = sets.autoHideController+","+$(dom).height()+","+sets.height+":"+new Date();
      var a = (sets.axis=="y" && $(dom).height()<sets.height);
      var b = (sets.axis=="x" && $(dom).width()<sets.width);
      if(a||b){
        context.hideController();
      }else{
        context.showController();
      }
      setTimeout(arguments.callee, frameRate);
    },frameRate);
  }


  return this;

  ////////////////////////////private methods //////////////////////////////
  function click(e){
    //alert('do something here');
    //this.innerHTML = "over "+new Date().toGMTString();
    //document.title="click ("+e.clientX+","+e.clientY+")"+/\d\d:\d\d:\d\d/.exec(new Date().toGMTString());
    var track = context.track[0].getBoundingClientRect();
    var width = e.clientX-track.left-sets.spinsize.big/2, height = e.clientY-track.top-sets.spinsize.big/2;
    scrollTo(width,height);
  }
  function over(e){
    //alert('do something here');
    //this.innerHTML = "over "+new Date().toGMTString();
    document.title="start ("+e.clientX+","+e.clientY+")"+/\d\d:\d\d:\d\d/.exec(new Date().toGMTString());
  }
  function out(e){
    //alert('do something here');
    //this.innerHTML = "out "+new Date().toGMTString();
    //document.title+="end ("+e.clientX+","+e.clientY+")"+/\d\d:\d\d:\d\d/.exec(new Date().toGMTString());
  }
  function rolling(e){
    //alert('do something here');
    e=e||event;
    if(e.wheelDelta||e.detail){
      //alert("whell");
      var delta = (e.wheelDelta||e.detail)<0?sets.tick:-sets.tick;
      //reverse for MF;
      var ua = navigator.userAgent;
      delta = (ua.indexOf("Firefox")!=-1&&ua.indexOf("Navigator")==-1?-delta:delta);
      scrollBy(delta,delta);
    }else{
      var width = e.clientX - deltaX;
      var height = e.clientY - deltaY;
      scrollTo(width,height);
    }
    //document.title="capturing ("+e.clientX+","+e.clientY+")-("+deltaX+","+deltaY+")"+/\d\d:\d\d:\d\d/.exec(new Date().toGMTString());
    //this.innerHTML = "roling "+new Date().toGMTString()+"<br>"+delta;
    //for(var p in e)
    //this.innerHTML += "<br>"+p+"="+e[p];
    // We've handled this event. Don't let anybody else see it.

    if (e.stopPropagation) e.stopPropagation( );  // DOM Level 2
    else e.cancelBubble = true;                      // IE
    // Now prevent any default action.
    if (e.preventDefault) e.preventDefault( );   // DOM Level 2
    return false; //prevent default scroll for IE
  }
  function scrollBy(dx,dy){
    var top = parseInt(context.nob[0].style.top,10);
    var left = parseInt(context.nob[0].style.left,10);
    //context.road[0].innerHTML = new Date().toGMTString()+"<br>"+context.nob[0].style.top+"|"+delta;
    scrollTo(left+dx,top+dy);
  }

  function scrollTo(width,height){
    var track = context.track[0].getBoundingClientRect();
    var nob = context.nob[0].getBoundingClientRect();
    var isAxisX = (sets.axis=="x"||sets.axis!="y");
    var isAxisY = (sets.axis=="y"||sets.axis!="x");

    context.shadow[0].style.left = (width) + "px";
    context.shadow[0].style.top = (height) + "px";
    context.shadow.show();
    var shadow = context.shadow[0].getBoundingClientRect();
    context.shadow.hide();
    var canMoveX = shadow.left>=track.left && shadow.right<=track.right;
    var canMoveY = shadow.top>=track.top && shadow.bottom<=track.bottom;

    var bescrollHeight = context.inner.attr("scrollHeight")-sets.height;
    var bescrollWidth = context.inner.attr("scrollWidth")-sets.width;

    //var destX = parseInt(parseInt("0"+context.nob[0].style.left,10)*bescrollWidth/sets.nobmaxwidth);
    //var destY = parseInt(parseInt("0"+context.nob[0].style.top,10)*bescrollHeight/sets.nobmaxheight);
    //alert("d:"+destX+"|"+destY+"|"+context.nob[0].style.left);
    //if(isAxisX&&(dirX=="+"&&nob.right<=track.right||dirX=="-"&&nob.left>=track.left)){
    if(isAxisX&&canMoveX){
      context.nob[0].style.left = (width) + "px";
      var destX = parseInt(parseInt("0"+context.nob[0].style.left,10)*bescrollWidth/sets.nobmaxwidth);
      context.inner.stop().animate({"scrollLeft":destX},sets.spend);
    }else if(isAxisX){
      context.nob[0].style.left = (shadow.left<track.left?0:sets.nobmaxwidth) + "px";
      context.inner.stop().animate({"scrollLeft":(shadow.left<track.left?0:bescrollWidth)},sets.spend);
    }
    //if(isAxisY&&(dirY=="+"&&nob.bottom<=track.bottom||dirY=="-"&&nob.top>=track.top)){
    if(isAxisY&&canMoveY){
      context.nob[0].style.top = (height) + "px";
      var destY = parseInt(parseInt("0"+context.nob[0].style.top,10)*bescrollHeight/sets.nobmaxheight);
      context.inner.stop().animate({"scrollTop":destY},sets.spend);
    }else if(isAxisY){
      context.nob[0].style.top = (shadow.top<track.top?0:sets.nobmaxheight) + "px";
      context.inner.stop().animate({"scrollTop":(shadow.top<track.top?0:bescrollHeight)},sets.spend);
    }
    sets.onscroll.call(context);
    //document.title = canMoveX+"|"+canMoveY+"|"+nob.left+"|"+nob.right+"|";
    //document.title = shadow.left+"|"+shadow.right+"|"+track.left+"|"+track.right;
  }
  
  function proxy(tag,fun){
    return function(e){
      if(typeof(fun)=="function")
        return fun.call(tag,e);
      return null
    }
  }

  function bind(tag,event,handler,capture){
    if(typeof(handler)!="function")throw new Error("handler must a function");
    if(typeof(tag)!="object") throw new Error("tag must an DOM element");
    capture = capture?true:false;
    if (tag.addEventListener){
      tag.addEventListener(event.replace(/^on/,""),proxy(tag,handler),capture);
      if(event=="DOMMouseScroll") //Opera/Chrome/Safari
        tag.onmousewheel=handler;
        //tag.addEventListener("onmousewheel", handler, capture);
    }else if(tag.attachEvent){
      tag.attachEvent(event,proxy(tag,handler));
    }else{
      tag[event] = proxy(tag,handler);
    }
  }

  function loos(tag,event,handler,capture){
    if(typeof(handler)!="function")throw new Error("handler must a function");
    if(typeof(tag)!="object") throw new Error("tag must an DOM element");
    capture = capture?true:false;
    if (tag.addEventListener){
      tag.removeEventListener(event.replace(/^on/,""),handler,capture);
    }else if(tag.detachEvent){
      tag.detachEvent(event,handler);
    }else{
      tag[event] = null; //arbitary set null
    }
  }

  function Capture(begin,enter,end,tag){

    bind(tag,begin.name,capture);
    //alert(begin.name+"|"+enter.name+"|"+end.name);

    //var deltaX, deltaY; use external variables
    var enterfun = proxy(tag,enter.fun);
    var endfun = proxy(tag,end.fun);
    //bind(tag,enter.name,function(){if(enter.fun) return enter.fun();});

    function capture(e){
      e = e||event;
      var startX = e.clientX, startY = e.clientY; //事件:击点对视区左上角
      var origX = context.nob[0].offsetLeft, origY = context.nob[0].offsetTop; //对象:对象对body左上角
      deltaX = startX - origX, deltaY = startY - origY; //求出对象对client的原点坐标差
      if (document.addEventListener) {  // DOM Level 2 event model
        //alert("document.addEventListener="+document.addEventListener);
        if(enter.name=="DOMMouseScroll") //Opera/Chrome/Safari
          tag.onmousewheel=enterfun;
          //document.addEventListener("onmousewheel", enterfun, true);
        document.addEventListener(enter.name.replace(/^on/,""), enterfun, true);
        document.addEventListener(end.name.replace(/^on/,""), release, true);
        //bind(document,enter.name,enterfun,true);
        //bind(document,end.name,release,true);
      } else if (document.attachEvent) {  // IE 5+ Event Model
        tag.setCapture( );
        if(enter.fun) tag.attachEvent(enter.name, enterfun);
        tag.attachEvent(end.name, release);
        // Treat loss of mouse capture as a mouseup event.
        tag.attachEvent("onlosecapture", release);
        //bind(tag,enter.name,enterfun);
        //bind(tag,end.name,release);
        //bind(tag,"onlosecapture",release);
      } else {  // IE 4 Event Model
        // In IE 4 we can't use attachEvent( ) or setCapture( ), so we set
        document[enter.name] = enterfun;
        document[end.name]= endfun;
      }

      // We've handled this event. Don't let anybody else see it.
      if (e.stopPropagation) e.stopPropagation( );  // DOM Level 2
      else e.cancelBubble = true;                      // IE

      // Now prevent any default action.
      if (e.preventDefault) e.preventDefault( );   // DOM Level 2

      //if(begin.fun) return begin.fun.call(tag,e);
      return proxy(tag,begin.fun)(e);
    }

    function release(e){
      e = e||event;
      if (document.removeEventListener) {  // DOM event model
        document.removeEventListener(enter.name.replace(/^on/,""), enterfun, true);
        document.removeEventListener(end.name.replace(/^on/,""), release, true);
        if(enter.name=="DOMMouseScroll") //Opera/Chrome/Safari
          tag.onmousewheel=enterfun;
          //document.removeEventListener("onmousewheel", enterfun, true);
        //looe(document,enter.name, enterfun, true);
        //looe(document,end.name, release, true);
      }else if (document.detachEvent) {  // IE 5+ Event Model
        tag.detachEvent(enter.name, enterfun);
        tag.detachEvent(end.name, release);
        tag.detachEvent("onlosecapture", release);
        //loos(tag,enter.name,enterfun);
        //loos(tag,end.name,release);
        //loos(tag,"onlosecapture", release);
        tag.releaseCapture( );
      }else {  // IE 4 Event Model
        document[enter.name] = null;
        document[end.name] = null;
      }
      if (e.stopPropagation) e.stopPropagation( );  // DOM Level 2
      else e.cancelBubble = true; // IE
      return endfun(e);
    }
  }

  function HitTest(rect, p){
    var left = p.x?(rect.left>p.x):false;
    var right = p.x?(rect.right<p.x):false;
    var hitX = !(left||right);
    var top = p.y?(rect.top>p.y):false;
    var bottom = p.y?(rect.bottom<p.y):false;
    var hitY = !(top||bottom);
    return {y:hitY,x:hitX,both:hitX&&hitY,left:left,right:right,bottom:bottom,top:top};
  }

  function BoundTest(dest,src,dir){
    var top = dest.top>src.top;
    var bottom = dest.bottom<src.bottom;
    var hitY = !(top||bottom);
    var left = dest.left>src.left;
    var right = dest.right < src.rigth;
    var hitX = !(left||right);
    return {y:hitY,x:hitX,both:hitX&&hitY,left:left,right:right,bottom:bottom,top:top};
  }

  //Thanks for JavaScript: The Definitive Guide, 5th Edition by David Flanagan
  //感谢David的示例代码，代码如诗，为我的二次开发节省了大量时间。
  //虽然可直接使用已实现的Capture方法，但在此仍直接引用。
  var oldmovehandler, olduphandler, deltaX, deltaY;
  //var oldX,oldY;
  function moveHandler(e) {
    //if(oldX==undefined) oldX = e.screenX;
    //if(oldY==undefined) oldY = e.screenY;
    if (!e) e = window.event; // IE Event Model
    //var isAxisX = HitTest(track,{x:e.clientX-deltaX}) && (sets.axis=="x"||sets.axis!="y");
    //var isAxisY = HitTest(track,{y:e.clientY-deltaY}) && (sets.axis=="y"||sets.axis!="x");
    //document.title = deltaX+"|"+deltaY+"|"+e.clientX+"|"+e.clientX;
    var width = e.clientX - deltaX;
    var height = e.clientY - deltaY;
    //var dirX = oldX>e.screenX?"-":"+";
    //var dirY = oldY>e.screenY?"-":"+";
    //oldX = e.screenX;
    //oldY = e.screenY;
    //document.title = e.screenX+"|"+dirX+"|"+dirY+"|"+track.left+"|"+track.right;
    //document.title = oldX+"|"+oldY+"|"+nob.left+"|"+nob.right+"|"+track.left+"|"+track.right;
    
    //log.info(true && BoundTest(track,nob,"y"));
    //log.info(nob.top+'|'+nob.bottom+'|'+nob.left+'|'+nob.right);
    //log.info(track.top+'|'+track.bottom+'|'+track.left+'|'+track.right);
    //log.info(e.clientY+'|'+deltaY);

    scrollTo(width,height);

    if (e.stopPropagation) e.stopPropagation( );  // DOM Level 2
    else e.cancelBubble = true;                  // IE
  }
  function upHandler(e) {
      context.trackbound = context.track[0].getBoundingClientRect();
      context.nobbound = context.nob[0].getBoundingClientRect();
      if (!e) e = window.event;  // IE Event Model
      if (document.removeEventListener) {  // DOM event model
          document.removeEventListener("mouseup", upHandler, true);
          document.removeEventListener("mousemove", moveHandler, true);
      }
      else if (document.detachEvent) {  // IE 5+ Event Model
          context.nob[0].detachEvent("onlosecapture", upHandler);
          context.nob[0].detachEvent("onmouseup", upHandler);
          context.nob[0].detachEvent("onmousemove", moveHandler);
          context.nob[0].releaseCapture( );
      }
      else {  // IE 4 Event Model
          // Restore the original handlers, if any
          document.onmouseup = olduphandler;
          document.onmousemove = oldmovehandler;
      }
      if (e.stopPropagation) e.stopPropagation( );  // DOM Level 2
      else e.cancelBubble = true;                  // IE
      
      if(sets.axis=="y" || sets.axis!="x"){
        if(context.nobbound.bottom>context.trackbound.bottom) context.nob.animate({top:sets.nobmaxheight},200);
        if(context.nobbound.top<context.trackbound.top) context.nob.animate({top:0},200);
      }
      if(sets.axis=="x" || sets.axis!="y"){
        if(context.nobbound.right>context.trackbound.right) context.nob.animate({left:sets.nobmaxwidth},200);
        if(context.nobbound.left<context.trackbound.left) context.nob.animate({left:0},200);
      }

  }
  function drag(event) {
      context.trackbound = context.track[0].getBoundingClientRect();
      context.nobbound = context.nob[0].getBoundingClientRect();

      var startX = event.clientX, startY = event.clientY; //事件:击点对视区左上角

      var track = context.track[0].getBoundingClientRect();


      // The original position (in document coordinates) of the
      // element that is going to be dragged. Since elementToDrag is
      // absolutely positioned, we assume that its offsetParent is the
      // document body.
      var origX = context.nob[0].offsetLeft, origY = context.nob[0].offsetTop; //对象:对象对body左上角

      // Even though the coordinates are computed in different
      // coordinate systems, we can still compute the difference between them
      // and use it in the moveHandler( ) function. This works because
      // the scrollbar position never changes during the drag.
      deltaX = startX - origX, deltaY = startY - origY; //求出对象对client的原点坐标差
      //log.info("startX="+startX+"|"+"startY="+startY);
      //log.info("origX="+origX+"|"+"origY="+origY);
      //log.info("deltaX="+deltaX+"|"+"deltaY="+deltaY);
      //log.info('|delta|'+deltaX+'|'+deltaY+"|rect|"+track.top+'|'+track.bottom+'|'+track.left+'|'+track.right+'|client|'+startX+'|'+startY+'|'+origX+'|'+origY);
      //log.info('|XY|'+event.X+'|'+event.Y+'|delta|'+deltaX+'|'+deltaY+'|client|'+startX+'|'+startY+'|'+origX+'|'+origY);

      if (document.addEventListener) {  // DOM Level 2 event model
          document.addEventListener("mousemove", moveHandler, true);
          document.addEventListener("mouseup", upHandler, true);
      }
      else if (document.attachEvent) {  // IE 5+ Event Model
          context.nob[0].setCapture( );
          context.nob[0].attachEvent("onmousemove", moveHandler);
          context.nob[0].attachEvent("onmouseup", upHandler);
          // Treat loss of mouse capture as a mouseup event.
          context.nob[0].attachEvent("onlosecapture", upHandler);
      }
      else {  // IE 4 Event Model
          // In IE 4 we can't use attachEvent( ) or setCapture( ), so we set
          oldmovehandler = document.onmousemove; // used by upHandler( )
          olduphandler = document.onmouseup;
          document.onmousemove = moveHandler;
          document.onmouseup = upHandler;
      }

      // We've handled this event. Don't let anybody else see it.
      if (event.stopPropagation) event.stopPropagation( );  // DOM Level 2
      else event.cancelBubble = true;                      // IE

      // Now prevent any default action.
      if (event.preventDefault) event.preventDefault( );   // DOM Level 2
  }

}
