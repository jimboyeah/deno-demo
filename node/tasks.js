// setTimeout(() => console.log('timeout1'));
// setTimeout(() => {
//     Promise.resolve().then(() => console.log('promise resolve1'))
//     console.log('timeout2')
//     Promise.resolve().then(() => console.log('promise resolve2'))
// });
// setTimeout(() => console.log('timeout3'));

console.log('0 script start');
let id = setInterval(() =>   console.log('10 setInterval'), 0);
setTimeout(() =>{ clearInterval(id); console.log('10 setTimeout')}, 0);
Promise.resolve().then(() => console.log('4 Promise'));
Promise.resolve().then(() => console.log('5 Promise'));
Promise.resolve().then(() => {
                             console.log('6 Promise');
    process.nextTick(() =>   console.log('9 nextTick'));
});
Promise.resolve().then(() => console.log('7 Promise'));
Promise.resolve().then(() => console.log('8 Promise'));

setImmediate(() => 			   console.log('11 setImmediate'));
setImmediate(() => 			   console.log('12 setImmediate'));

process.nextTick(() => 	 	 console.log('1 nextTick'));
process.nextTick(() => 	 	 console.log('2 nextTick'));
process.nextTick(() => 	 	 console.log('3 nextTick'));
console.log('0 script end');