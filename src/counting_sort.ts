console.log(countingSort(genArray(20)).join(","));
function genArray(len: number){
  let arr = [], scale = len*10;
  while(len-->0) arr.push(Math.ceil(Math.random()*scale));
  console.log(arr.join(","));
  return arr;
}

function countingSort(a: number[]){
    let c:{[key:number]:number} = {};
    let key = 0;
    for (var i = 0; i < a.length; ++i) {
        key = a[i];
        c[key] = c[key]? c[key] + 1:1;
    }
    key = 0;
    for(var k in c){
        for (var j = 0; j < c[k]; ++j) {
            a[key++] = +k;
        }
    }
    return a;
}
