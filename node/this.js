
console.log("module this", this, clearInterval);
void function(){
  this.navigator = "NAVIGATOR";
  console.log("function this", this, clearInterval);
}()

void function(){
  return function(){
    console.log("function-inner this", this, clearInterval);
  }
}()()

