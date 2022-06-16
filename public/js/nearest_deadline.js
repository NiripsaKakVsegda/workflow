Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


let a = [['веб', new Date().addDays(-5)],
    ['алгосы', new Date().addDays(7)],
    ['ответ', new Date().addDays(6)]]

a = a.filter((el) => el[1].getTime() >= new Date().getTime())
console.log(a)

a.sort((a, b) => a[1].getTime() >= b[1].getTime() ? 1 : -1)
console.log(a)