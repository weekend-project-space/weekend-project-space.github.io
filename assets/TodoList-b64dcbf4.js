import{c as x,r as y,o as n,a as d,b as e,w as c,v as V,t as f,F as k,d as C,x as b,y as g,n as w,e as B}from"./index-15638c9e.js";/* empty css                                                 */const K={class:"todo-warp"},M=["onKeyup"],T={class:"todo-list"},U=["onUpdate:modelValue"],D=["textContent"],E=["onClick"],z={__name:"TodoList",props:{modelValue:Array},emits:["update:modelValue"],setup(r,{emit:p}){const v=r,a=x(()=>v.modelValue),l=y(""),u=t=>{p("update:modelValue",t)};function m(){if(console.log(a),l.value.trim().length){let t=[...a.value,{value:l.value,done:!1}];u(t),l.value=""}}function _(t){let s=[...a.value];s.splice(t,1),u(s)}return(t,s)=>(n(),d("div",K,[e("div",null,[c(e("input",{class:"todo-add-input",type:"text",placeholder:"Todo Enter to add","onUpdate:modelValue":s[0]||(s[0]=o=>l.value=o),onKeyup:f(m,["enter"])},null,40,M),[[V,l.value]])]),e("ul",T,[(n(!0),d(k,null,C(B(a),(o,h)=>(n(),d("li",{class:"item",key:o.value},[e("i",null,[c(e("input",{type:"checkbox","onUpdate:modelValue":i=>o.done=i},null,8,U),[[b,o.done]])]),e("div",null,[e("p",{textContent:g(o.value),class:w({"todo-done":o.done})},null,10,D)]),e("div",{class:"btn mdi mdi-close",onClick:i=>_(h)},null,8,E)]))),128))])]))}};export{z as _};
