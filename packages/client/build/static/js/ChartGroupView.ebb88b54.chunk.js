(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[3],{382:function(e,t,a){"use strict";a.r(t),a.d(t,"ChartGroupView",(function(){return P}));var i=a(47),r=a(16),s=a(0),n=a(423),o=a(371),c=a(59),l=a.n(c),d=a(31),u=a(42),h=a(37),v=Object(h.a)(s.createElement("path",{d:"M4 18h17v-6H4v6zM4 5v6h17V5H4z"}),"ViewStream"),b=Object(h.a)(s.createElement("path",{d:"M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"}),"ViewModule"),m=a(456),j=a.n(m),x=a(40),p=a(433),O=a.n(p),f=a(434),y=a.n(f),g=a(344),M=a(34),I=a(457),w=a.n(I),D=a(1),G=new Date;G.setDate(G.getDate()+1),G.setHours(0),G.setMinutes(0),G.setSeconds(0),G.setMilliseconds(0);var T=new Date(G);T.setDate(G.getDate()-1),T.setHours(-4);var C=new Date;C.setHours(15),C.setMinutes(30),C.setSeconds(0),C.setMilliseconds(0);var _=new Date(C);_.setHours(22),_.setMinutes(0);var z=new Date(_);z.setDate(z.getDate()-1);var E=new Date;E.setHours(0),E.setMinutes(0),E.setSeconds(0),E.setMilliseconds(0);var k=new Date(E);k.setHours(2),k.setMinutes(0);var A=new Date(E);A.setHours(10),A.setMinutes(0);var S,V={chart:{renderTo:"container",panning:{enabled:!0,type:"xy"}},mapNavigation:{enabled:!0,enableMouseWheelZoom:!0},time:{timezoneOffset:T.getTimezoneOffset(),useUTC:!0},plotOptions:{},series:[{lineWidth:1,type:"spline",data:[],dragDrop:{draggableY:!1,draggableX:!1},softThreshold:!1}],xAxis:{type:"datetime",plotLines:[{value:E.getTime(),color:"black",dashStyle:"shortdash",width:1,zIndex:1},{value:z.getTime(),color:"red",dashStyle:"shortdash",width:1,zIndex:1},{value:k.getTime(),color:"orange",dashStyle:"shortdash",width:1,zIndex:1},{value:A.getTime(),color:"orange",dashStyle:"shortdash",width:1,zIndex:1},{value:C.getTime(),color:"blue",dashStyle:"shortdash",width:1,zIndex:1},{value:_.getTime(),color:"red",dashStyle:"shortdash",width:1,zIndex:1}],resize:{enabled:!0},endOnTick:!1,startOnTick:!1},yAxis:{resize:{enabled:!0},endOnTick:!1,startOnTick:!1}},H=function(e){var t=e.symbol,a=e.layout,i=e.range,n=void 0===i?"1":i,c=e.removeChart,l=e.chartsCount,u=!1,h=Object(s.useState)(),v=Object(r.a)(h,2),b=v[0],m=v[1],j=Object(d.useQuery)(M.u,{variables:{symbol:t,range:n,timestampFrom:T.getTime(),timestampTo:G.getTime()},fetchPolicy:"network-only"}),p=j.data,f=j.loading,I=j.error,C=Object(d.useSubscription)(M.y,{variables:{symbol:t}});Object(s.useEffect)((function(){b&&(u||(u=!0,b.container.addEventListener("wheel",(function(e){b.showResetZoom();var t=100/e.target.getBoundingClientRect().width*e.clientX,a=Math.sign(e.deltaY),i=b.xAxis[0].getExtremes(),r=b.yAxis[0].getExtremes(),s=(i.max-i.min)/100*20;if(a<0){var n=s/100*(100-t),o=s/100*t,c=i.min+o,l=i.max-n;c=Math.max(c,i.dataMin-(i.dataMax-i.dataMin)/2),l=Math.min(l,i.dataMax+(i.dataMax-i.dataMin)/2),b.xAxis[0].setExtremes(c,l)}else{var d=i.min-s,u=i.max+s;if(d=Math.max(d,i.dataMin-(i.dataMax-i.dataMin)/2),u=Math.min(u,i.dataMax+(i.dataMax-i.dataMin)/2),b.xAxis[0].setExtremes(d,u),r){var h=(r.dataMax-r.dataMin)/100*10;b.yAxis[0].setExtremes(r.dataMin-h,r.dataMax+h)}}}))))}),[null===b||void 0===b?void 0:b.container]),Object(s.useEffect)((function(){var e;if(b&&(null===(e=C.data)||void 0===e?void 0:e.lastPrice)){var t,a,i,r,s=60*Math.floor((null===(t=C.data)||void 0===t?void 0:t.lastPrice.timestamp)/1e3/60)*1e3,n=!1,o=(null===(a=b.series[0])||void 0===a||null===(i=a.options)||void 0===i?void 0:i.data)||[];if(Array.isArray(o)&&o.length){var c,l=o[o.length-1];if(l[0]===s)l[1]=null===(c=C.data)||void 0===c?void 0:c.lastPrice.price,n=!0}if(!n)o.push([s,null===(r=C.data)||void 0===r?void 0:r.lastPrice.price]),n=!0;n&&b.series[0].setData(Object(x.a)(o),!0,!1,!0)}}),[b,C.data]),Object(s.useEffect)((function(){b&&b.reflow()}),[b,a,l]),Object(s.useEffect)((function(){b&&b.setTitle({text:t})}),[b,t]),Object(s.useEffect)((function(){if(!f&&p&&!I&&b){var e,t,a=null===(e=p.getPrices)||void 0===e||null===(t=e.priceArray)||void 0===t?void 0:t.map((function(e){return[null===e||void 0===e?void 0:e.timestamp,null===e||void 0===e?void 0:e.price]}));a&&b.series[0].setData(a,!0,!1,!0)}}),[p,f,I,b]);var _=Object(s.useCallback)((function(){c()}),[c]);return Object(D.jsxs)("div",{className:w.a.container,children:[f&&Object(D.jsx)("div",{children:"Loading chart..."}),!I&&!f&&p&&Object(D.jsxs)("div",{className:w.a.chartWrapper,children:[Object(D.jsx)(o.a,{onClick:_,children:Object(D.jsx)(g.a,{})}),Object(D.jsx)(y.a,{highcharts:O.a,options:V,callback:m})]})]})},R=a(178),N=["GME","NIO","BNGO","NVAX"];!function(e){e[e.VERTICAL=0]="VERTICAL",e[e.GRID=1]="GRID"}(S||(S={}));var P=function(){var e,t,a,c,h,m=Object(u.g)(),x=Object(s.useState)(S.VERTICAL),p=Object(r.a)(x,2),O=p[0],f=p[1],y=Object(d.useQuery)(M.o,{fetchPolicy:"network-only",variables:{chartGroupId:m.chartGroupId}}),g=Object(d.useMutation)(M.a,{fetchPolicy:"no-cache",refetchQueries:[{query:M.o,variables:{chartGroupId:m.chartGroupId}}]}),I=Object(r.a)(g,2),w=I[0],G=(I[1],Object(d.useMutation)(M.z,{fetchPolicy:"no-cache",refetchQueries:[{query:M.o,variables:{chartGroupId:m.chartGroupId}}]})),T=Object(r.a)(G,2),C=T[0],_=(T[1],Object(s.useCallback)((function(e){var t,a;e&&m.chartGroupId&&w({variables:{chartGroupId:m.chartGroupId,symbol:e,order:(null===y||void 0===y||null===(t=y.data)||void 0===t||null===(a=t.getChartGroup)||void 0===a?void 0:a.charts.length)||0,range:"1"}})}),[w,m])),z=Object(s.useCallback)((function(e){return function(){C({variables:{chartGroupId:m.chartGroupId,symbol:e}})}}),[C]),E=Object(s.useCallback)((function(e){return function(){return f(e)}}),[]);return Object(D.jsxs)("div",{className:j.a.container,children:[Object(D.jsx)("div",{className:j.a.header,children:Object(D.jsxs)(n.a,{m:0,className:j.a.box,children:[Object(D.jsx)(n.a,{ml:1,mr:3,children:null===(e=y.data)||void 0===e?void 0:e.getChartGroup.name}),Object(D.jsx)("span",{children:Object(D.jsx)(R.a,{save:_})}),Object(D.jsx)(o.a,{onClick:E(S.VERTICAL),children:Object(D.jsx)(v,{color:"primary"})}),Object(D.jsx)(o.a,{onClick:E(S.GRID),children:Object(D.jsx)(b,{color:"primary"})})]})}),Object(D.jsx)("div",{className:l()(j.a.body,(t={},Object(i.a)(t,j.a.vertical,O===S.GRID),Object(i.a)(t,j.a.grid,O===S.GRID&&N.length>1),t)),children:null===(a=y.data)||void 0===a||null===(c=a.getChartGroup)||void 0===c||null===(h=c.charts)||void 0===h?void 0:h.map((function(e){var t,a,i;return Object(D.jsx)(H,{symbol:(null===e||void 0===e?void 0:e.symbol)||"",layout:O,chartsCount:(null===(t=y.data)||void 0===t||null===(a=t.getChartGroup)||void 0===a||null===(i=a.charts)||void 0===i?void 0:i.length)||0,range:null===e||void 0===e?void 0:e.range,removeChart:z((null===e||void 0===e?void 0:e.symbol)||"")},null===e||void 0===e?void 0:e.symbol)}))})]})}},456:function(e,t,a){e.exports={container:"styles_container__1TDwt",header:"styles_header__3B7l4",box:"styles_box__2A0lW",body:"styles_body__2vSkX",grid:"styles_grid__298Jq"}},457:function(e,t,a){e.exports={container:"styles_container__13jtq",chartWrapper:"styles_chartWrapper__6E823"}}}]);
//# sourceMappingURL=ChartGroupView.ebb88b54.chunk.js.map