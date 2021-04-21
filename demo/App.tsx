/* 
 * https://dev.to/craigmorten/deno-bundle-for-server-side-rendered-react-11c2
 * https://dev.to/craigmorten/writing-a-react-ssr-app-in-deno-2m7
 * deno run --reload --allow-net --allow-read --unstable .\server.tsx
 * deno run --allow-net --allow-read --unstable ./server.tsx
 *                                   ^^^^^^^^^^ this is important!
 * // @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
 */
// @deno-types="https://raw.githubusercontent.com/Soremwar/deno_types/4a50660/react/v16.13.1/react.d.ts"

import React from "https://dev.jspm.io/react@16.13.1";
// console.log({React});

const AppFC = () => {
  let [ss, setCount] = React.useState({count: 0});
  let count = ss.count + 1;
  let set = () => setCount({count});
  return (
    <div>
      <h1>Hello Deno Land!</h1>
      <button onClick={set}>Click the 🦕</button>
      <p>You clicked the 🦕 {count} times</p>
    </div>
  );
};

class App extends React.Component {
  state = {value:0}
  render(){
    let {value: count} = this.state;
    if(count>2) return <AppFC />;
    let set = () => this.setState({value: count + 1});
    return (
      <div>
        <h1>Hello Deno Land!</h1>
        <button onClick={set}>Click the 🦕</button>
        <p>You clicked the 🦕 {count} times</p>
      </div>
    );
  }
}

export default App;
