console.log(sortArray(genArray(20)).join(","));
function genArray(len: number){
  let arr = [], scale = len*10;
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
    if(low >= high) return;
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