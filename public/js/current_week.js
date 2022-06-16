const curr = new Date;
const first = curr.getDate() - curr.getDay();

let monday = new Date(curr.setDate(first)).toLocaleString();
let tuesday = new Date(curr.setDate(first + 1)).toLocaleString();
let wednesday = new Date(curr.setDate(first + 2)).toLocaleString();
let thursday = new Date(curr.setDate(first + 3)).toLocaleString();
let friday = new Date(curr.setDate(first + 4)).toLocaleString();
let saturday = new Date(curr.setDate(first + 5)).toLocaleString();
let sunday = new Date(curr.setDate(first + 6)).toLocaleString();

console.log(monday.substring(0, 5))
console.log(tuesday.substring(0, 5))
console.log(wednesday.substring(0, 5))
console.log(thursday.substring(0, 5))
console.log(friday.substring(0, 5))
console.log(saturday.substring(0, 5))
console.log(sunday.substring(0, 5))

const p = document.getElementsByClassName('date date-1')
console.log(p.innerText)






