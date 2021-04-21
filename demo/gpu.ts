// 执行 `deno run --unstable https://deno.land/posts/v1.8/webgpu_discover.ts`

// 尝试从用户代理来获取一个 adapter 适配器
// const adapter = await Deno.navigator.gpu.requestAdapter();
// if (adapter) {
//   // 打印出这个适配器的一些基本详情
//   console.log(`Found adapter: ${adapter.name}`);
//   const features = [...adapter.features.values()];
//   console.log(`Supported features: ${features.join(", ")}`);
// } else {
//   console.error("No adapter found");
// }
console.log(sortArray(genArray(200)).join(","));
function genArray(len: number){
  let arr = [], scale = len*100;
  while(len-->0) arr.push(Math.ceil(Math.random()*scale));
  console.log(arr.join(","));
  return arr;
}

function sortArray(nums: number[]): number[] {
    quickSort(nums, 0, nums.length-1);
    return nums;
};

function quickSort(nums: number[], low:number, high: number){
    let s = low, e = high;
    if(low<high){
        let p = nums[high];
        while(low<high){
            while(low<high && nums[low]<p) low++;
            nums[high] = nums[low];
            while(low<high && nums[high]>=p) high--;
            nums[low] = nums[high];
        }
        nums[high] = p;
        quickSort(nums, s, low-1);
        quickSort(nums, low+1, e);
    }
}